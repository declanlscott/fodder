package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
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

const BaseApiUrl = "https://www.culvers.com/flavor-of-the-day"
const BaseImageUrl = "https://cdn.culvers.com/menu-item-detail"

type NextData struct {
	Props struct {
		PageProps struct {
			Page struct {
				CustomData struct {
					FlavorDetails struct {
						IdFlavor    int    `json:"idFlavor"`
						IdMenuItem  int    `json:"idMenuItem"`
						Slug        string `json:"slug"`
						Name        string `json:"name"`
						Description string `json:"description"`
						FotdImage   string `json:"fotdImage"`
						Allergens   string `json:"allergens"`
						Ingredients []struct {
							Id             int    `json:"id"`
							Title          string `json:"title"`
							SubIngredients string `json:"subIngredients"`
						}
						FlavorCategories []struct {
							Id   int    `json:"id"`
							Name string `json:"name"`
						}
					} `json:"flavorDetails"`
				} `json:"customData"`
			} `json:"page"`
		} `json:"pageProps"`
	} `json:"props"`
}

type Flavor struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	ImageUrl    string   `json:"imageUrl"`
	Allergens   []string `json:"allergens"`
}

type ScrapeError struct {
	StatusCode int
}

func (e *ScrapeError) Error() string {
	return fmt.Errorf("received status code %d", e.StatusCode).Error()
}

func scrapeFlavor(slug string, client HttpClient) (*Flavor, error) {
	req, err := http.NewRequest(
		"GET",
		fmt.Sprintf("%s/%s", BaseApiUrl, slug),
		nil,
	)
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

	flavorProps := nextData.Props.PageProps.Page.CustomData.FlavorDetails
	flavor := Flavor{
		Name:        flavorProps.Name,
		Description: flavorProps.Description,
		ImageUrl: fmt.Sprintf(
			"%s/%s",
			BaseImageUrl,
			flavorProps.FotdImage,
		),
		Allergens: strings.Split(flavorProps.Allergens, ", "),
	}

	return &flavor, nil
}

func getExpiration(requestTime time.Time) time.Duration {
	chicago, _ := time.LoadLocation("America/Chicago")
	chicagoTime := requestTime.In(chicago)
	chicagoMidnight := time.Date(chicagoTime.Year(), chicagoTime.Month(), chicagoTime.Day(), 0, 0, 0, 0, chicago)

	expiration := chicagoMidnight.Sub(chicagoTime)
	if expiration < 0 {
		expiration += 24 * time.Hour
	}

	return expiration
}

func getResponseBody(ctx context.Context, slug string) ([]byte, error) {
	requestTime := time.Now().UTC()

	opt, err := redis.ParseURL(os.Getenv("UPSTASH_REDIS_URL"))
	if err != nil {
		return nil, err
	}

	rdb := redis.NewClient(opt)
	key := fmt.Sprintf("flavor:%s", slug)

	body, err := rdb.Get(ctx, key).Bytes()
	if err == redis.Nil {
		// Cache miss
		flavor, err := scrapeFlavor(slug, &http.Client{
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
		})
		if err != nil {
			return nil, err
		}

		body, err := json.Marshal(flavor)
		if err != nil {
			return nil, err
		}

		expiration := getExpiration(requestTime)
		rdb.Set(ctx, key, body, expiration)

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

	body, err := getResponseBody(ctx, slug)
	if err != nil {
		var scrapeError *ScrapeError
		if errors.As(err, &scrapeError) {
			if scrapeError.StatusCode == http.StatusNotFound {
				return events.APIGatewayProxyResponse{
					StatusCode: http.StatusNotFound,
					Headers:    headers,
					Body:       fmt.Sprintf("{\"message\": \"Flavor not found.\"}"),
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
