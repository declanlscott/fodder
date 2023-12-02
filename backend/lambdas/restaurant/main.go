package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/redis/go-redis/v9"
)

type HttpClient interface {
	Do(req *http.Request) (*http.Response, error)
}

const BaseApiUrl = "https://www.culvers.com/restaurants"
const BaseImageUrl = "https://cdn.culvers.com/menu-item-detail"
const LogoSvgUrl = "https://cdn.culvers.com/layout/logo.svg"

type NextData struct {
	Props struct {
		PageProps struct {
			Page struct {
				CustomData struct {
					RestaurantDetails struct {
						Id                int           `json:"id"`
						Number            string        `json:"Number"`
						Title             string        `json:"title"`
						Slug              string        `json:"slug"`
						PhoneNumber       string        `json:"phoneNumber"`
						Address           string        `json:"address"`
						City              string        `json:"city"`
						State             string        `json:"state"`
						PostalCode        string        `json:"postalCode"`
						Latitude          float64       `json:"latitude"`
						Longitude         float64       `json:"longitude"`
						OnlineOrderUrl    string        `json:"onlineOrderUrl"`
						OwnerFriendlyName string        `json:"ownerFriendlyName"`
						OwnerMessage      string        `json:"ownerMessage"`
						JobsApplyUrl      string        `json:"jobsApplyUrl"`
						FlavorOfTheDay    []FlavorProps `json:"flavorOfTheDay"`
					} `json:"restaurantDetails"`
					RestaurantCalendar struct {
						Restaurant struct {
							Id    int    `json:"id"`
							Title string `json:"title"`
							Slug  string `json:"slug"`
						}
						Flavors []FlavorProps `json:"flavors"`
					}
				} `json:"customData"`
			} `json:"page"`
		} `json:"pageProps"`
	} `json:"props"`
}

type FlavorProps struct {
	FlavorId   int    `json:"flavorId"`
	MenuItemId int    `json:"menuItemId"`
	OnDate     string `json:"onDate"`
	Title      string `json:"title"`
	UrlSlug    string `json:"urlSlug"`
	Image      struct {
		UseWhiteBackground bool   `json:"useWhiteBackground"`
		Src                string `json:"src"`
	}
}

type Restaurant struct {
	Name        string   `json:"name"`
	Address     string   `json:"address"`
	City        string   `json:"city"`
	State       string   `json:"state"`
	ZipCode     string   `json:"zipCode"`
	PhoneNumber string   `json:"phoneNumber"`
	Flavors     []Flavor `json:"flavors"`
}

type Flavor struct {
	Date     string `json:"date"`
	Name     string `json:"name"`
	ImageUrl string `json:"imageUrl"`
	Slug     string `json:"slug"`
}

type ScrapeError struct {
	StatusCode int
}

func (e *ScrapeError) Error() string {
	return fmt.Errorf("received status code %d", e.StatusCode).Error()
}

func isValidDate(flavorProps FlavorProps, requestTime time.Time) (bool, error) {
	fodDate, err := time.Parse("2006-01-02T15:04:05", flavorProps.OnDate)
	if err != nil {
		return false, err
	}

	today := requestTime.Truncate(24 * time.Hour)

	if fodDate.After(today) || fodDate.Equal(today) {
		return true, nil
	}

	return false, nil
}

func filterFlavorsByDate(flavorsProps []FlavorProps, requestTime time.Time) ([]FlavorProps, error) {
	var result []FlavorProps

	for _, flavorProps := range flavorsProps {
		isValid, err := isValidDate(flavorProps, requestTime)
		if err != nil {
			return result, err
		}

		if isValid {
			result = append(result, flavorProps)
		}
	}

	return result, nil
}

func scrapeRestaurant(slug string, requestTime time.Time, client HttpClient) (*Restaurant, error) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/%s", BaseApiUrl, slug), nil)
	if err != nil {
		return nil, err
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return nil, &ScrapeError{res.StatusCode}
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	re := regexp.MustCompile(`<script id="__NEXT_DATA__" type="application/json">(.*?)</script>`)
	matches := re.FindStringSubmatch(string(body))
	if len(matches) != 2 {
		return nil, errors.New("could not find __NEXT_DATA__")
	}

	var nextData NextData
	err = json.Unmarshal([]byte(matches[1]), &nextData)
	if err != nil {
		return nil, err
	}

	flavorsProps, err := filterFlavorsByDate(
		nextData.Props.PageProps.Page.CustomData.RestaurantCalendar.Flavors,
		requestTime,
	)
	if err != nil {
		return nil, err
	}

	var flavors []Flavor
	for _, flavorProps := range flavorsProps {
		flavor := Flavor{
			Date: flavorProps.OnDate,
			Name: flavorProps.Title,
			ImageUrl: func() string {
				urlSplit := strings.Split(flavorProps.Image.Src, "400/")
				if len(urlSplit) != 2 {
					return LogoSvgUrl
				}

				return fmt.Sprintf(
					"%s/%s?%s",
					BaseImageUrl,
					urlSplit[1],
					url.Values{
						"w": {"400"},
					}.Encode(),
				)
			}(),
			Slug: flavorProps.UrlSlug,
		}

		flavors = append(flavors, flavor)
	}

	restaurantProps := nextData.Props.PageProps.Page.CustomData.RestaurantDetails
	restaurant := Restaurant{
		Name:        restaurantProps.Title,
		Address:     restaurantProps.Address,
		City:        restaurantProps.City,
		State:       restaurantProps.State,
		ZipCode:     restaurantProps.PostalCode,
		PhoneNumber: restaurantProps.PhoneNumber,
		Flavors:     flavors,
	}

	return &restaurant, nil
}

func getExpiration(requestTime time.Time) time.Duration {
	chicago, _ := time.LoadLocation("America/Chicago")

	_, offset := requestTime.In(chicago).Zone()

	return time.Until(requestTime.Truncate(24 * time.Hour).Add(24 * time.Hour).Add(time.Duration(offset) * time.Second * -1))
}

func getResponseBody(ctx context.Context, slug string, requestTime time.Time) ([]byte, error) {
	opt, err := redis.ParseURL(os.Getenv("UPSTASH_REDIS_URL"))
	if err != nil {
		return nil, err
	}

	rdb := redis.NewClient(opt)
	key := fmt.Sprintf("restaurant:%s", slug)

	body, err := rdb.Get(ctx, key).Bytes()
	if err == redis.Nil {
		// Cache miss
		restaurant, err := scrapeRestaurant(
			slug,
			requestTime,
			&http.Client{
				CheckRedirect: func(req *http.Request, via []*http.Request) error {
					return http.ErrUseLastResponse
				},
			},
		)
		if err != nil {
			return nil, err
		}

		body, err := json.Marshal(restaurant)
		if err != nil {
			return nil, err
		}

		rdb.Set(ctx, key, body, getExpiration(requestTime))

		return body, nil
	}

	return body, nil
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	requestTime := time.UnixMilli(request.RequestContext.RequestTimeEpoch)

	slug := request.PathParameters["slug"]

	headers := map[string]string{
		"Content-Type":                     "application/json",
		"Access-Control-Allow-Origin":      "*",
		"Access-Control-Allow-Headers":     "Content-Type",
		"Access-Control-Allow-Methods":     "GET",
		"Access-Control-Allow-Credentials": "true",
	}

	body, err := getResponseBody(ctx, slug, requestTime)
	if err != nil {
		var scrapeError *ScrapeError
		if errors.As(err, &scrapeError) {
			// External API redirects with HTTP 302 when the restaurant is not found
			if scrapeError.StatusCode == http.StatusFound {
				return events.APIGatewayProxyResponse{
					StatusCode: http.StatusNotFound,
					Headers:    headers,
					Body:       fmt.Sprintf("{\"message\": \"Restaurant not found.\"}"),
				}, nil
			}
		}

		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("{\"message\": \"%s\"}", err.Error()),
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Headers:    headers,
		Body:       string(body),
	}, nil
}

func main() {
	lambda.Start(handler)
}
