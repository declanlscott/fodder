package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/redis/go-redis/v9"
)

type HttpClient interface {
	Do(req *http.Request) (*http.Response, error)
}

const EXTERNAL_API_BASE_URL = "https://www.culvers.com/restaurants"
const LOGO_SVG_SRC = "//cdn.culvers.com/layout/logo.svg"

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

func getSlugFromName(name string) string {
	// Match any non-alphabetic characters
	re := regexp.MustCompile(`[^a-zA-Z\s]+`)
	slug := re.ReplaceAllString(name, "")

	// Match any whitespace characters
	re = regexp.MustCompile(`\s+`)
	slug = strings.ToLower(re.ReplaceAllString(slug, "-"))

	return slug
}

func scrapeRestaurant(slug string, client HttpClient) (*Restaurant, error) {
	url := fmt.Sprintf("%s/%s", EXTERNAL_API_BASE_URL, slug)

	req, err := http.NewRequest("GET", url, nil)
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

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return nil, err
	}

	name := doc.Find("#upcoming .upperstub .content .fotd a").Text()
	today := Flavor{
		Date: strings.TrimSpace(strings.Replace(doc.Find("#upcoming .upperstub h3").Text(), "TODAY –", "", 1)),
		Name: name,
		ImageUrl: fmt.Sprintf("https:%s", func() string {
			if src, exists := doc.Find("#upcoming .upperstub img").Attr("src"); exists {
				return strings.Replace(src, "140", "400", 1)
			}

			return LOGO_SVG_SRC
		}()),
		Slug: getSlugFromName(name),
	}

	var upcoming []Flavor
	upcomingSelector := doc.Find("#upcoming .lowerstub")
	for index := range upcomingSelector.Nodes {
		selection := upcomingSelector.Eq(index)

		name = selection.Find(".content .fotd a").Text()

		upcoming = append(upcoming, Flavor{
			Date: strings.TrimSpace(strings.Replace(selection.Find("h3").Text(), "TOMORROW –", "", 1)),
			Name: name,
			ImageUrl: fmt.Sprintf("https:%s", func() string {
				if src, exists := selection.Find("img").Attr("src"); exists {
					return strings.Replace(src, "140", "400", 1)
				}

				return LOGO_SVG_SRC
			}()),
			Slug: getSlugFromName(name),
		})
	}

	addressSelector := doc.Find("p.restaurant-address span")
	address := addressSelector.Eq(0).Text()
	city := addressSelector.Eq(2).Text()
	state := doc.Find("p.restaurant-address abbr").Text()
	zipCode := addressSelector.Eq(3).Text()
	phoneNumber := addressSelector.Eq(5).Find("a").Text()

	restaurant := Restaurant{
		Name:        strings.TrimSpace(doc.Find(".ModuleContentHeader h1").Text()),
		Address:     address,
		City:        city,
		State:       state,
		ZipCode:     zipCode,
		PhoneNumber: phoneNumber,
		Flavors:     append([]Flavor{today}, upcoming...),
	}

	return &restaurant, nil
}

func getExpirationDuration(currentTime time.Time) time.Duration {
	expirationDate := time.Date(
		currentTime.Year(),
		currentTime.Month(),
		currentTime.Day(),
		7,
		30,
		0,
		0,
		time.UTC,
	)

	if currentTime.After(expirationDate) {
		expirationDate = expirationDate.Add(24 * time.Hour)
	}

	expirationDuration := expirationDate.Sub(currentTime)

	return expirationDuration
}

func getResponseBody(ctx context.Context, slug string) ([]byte, error) {
	opt, err := redis.ParseURL(os.Getenv("UPSTASH_REDIS_URL"))
	if err != nil {
		return nil, err
	}

	rdb := redis.NewClient(opt)
	key := fmt.Sprintf("restaurant:%s", slug)

	body, err := rdb.Get(ctx, key).Bytes()
	if err == redis.Nil {
		// Cache miss
		restaurant, err := scrapeRestaurant(slug, &http.Client{
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
		})
		if err != nil {
			return nil, err
		}

		body, err := json.Marshal(restaurant)
		if err != nil {
			return nil, err
		}

		rdb.Set(ctx, key, body, getExpirationDuration(time.Now().UTC()))

		return body, nil
	}

	return body, nil
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	slug := request.PathParameters["slug"]

	headers := map[string]string{
		"Content-Type":                     "application/json",
		"Access-Control-Allow-Origin":      "*",
		"Access-Control-Allow-Headers":     "Content-Type",
		"Access-Control-Allow-Methods":     "GET",
		"Access-Control-Allow-Credentials": "true",
	}

	// TODO: Remove this once we can parse the data from the external API again
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusServiceUnavailable,
		Headers:    headers,
		Body:       "{\"message\": \"Service Unavailable.\"}",
	}, nil

	body, err := getResponseBody(ctx, slug)
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
