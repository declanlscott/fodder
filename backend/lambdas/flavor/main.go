package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
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

const EXTERNAL_API_BASE_URL = "https://www.culvers.com/flavor-of-the-day"
const LOGO_SVG_SRC = "//cdn.culvers.com/layout/logo.svg"

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

	flavor := Flavor{
		Name:        doc.Find(".fotd-detail-copy h1").Text(),
		Description: doc.Find(".ModuleFotdDetail-description p").Text(),
		ImageUrl: fmt.Sprintf("https:%s", func() string {
			if src, exists := doc.Find(".fotd-detail-image img").Attr("src"); exists {
				return src
			}

			return LOGO_SVG_SRC
		}()),
		Allergens: func() []string {
			var allergens []string
			allergenSelector := doc.Find(".ModuleMenuItemDetail-allergens .col-xs-10 ul li")
			for index := range allergenSelector.Nodes {
				selection := allergenSelector.Eq(index)

				allergens = append(allergens, strings.TrimSpace(selection.Text()))
			}

			return allergens
		}(),
	}

	return &flavor, nil
}

func getExpirationDuration(currentTime time.Time) time.Duration {
	daysUntilSunday := time.Sunday - currentTime.Weekday()

	if daysUntilSunday <= 0 {
		daysUntilSunday += 7
	}

	durationUntilSunday := time.Duration(daysUntilSunday*24) * time.Hour
	nextSunday := currentTime.Add(durationUntilSunday)
	expirationDate := time.Date(
		nextSunday.Year(),
		nextSunday.Month(),
		nextSunday.Day(),
		0,
		0,
		0,
		0,
		time.UTC,
	)

	expirationDuaration := expirationDate.Sub(currentTime)

	return expirationDuaration
}

func getResponseBody(ctx context.Context, slug string) ([]byte, error) {
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
