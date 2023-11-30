package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type HttpClient interface {
	Do(req *http.Request) (*http.Response, error)
}

const API_URL = "https://www.culvers.com/flavor-of-the-day"
const LOGO_SVG_SRC = "//cdn.culvers.com/layout/logo.svg"

type Flavor struct {
	Name     string `json:"name"`
	ImageUrl string `json:"imageUrl"`
	Slug     string `json:"slug"`
}

func scrapeFlavors(client HttpClient) ([]Flavor, error) {
	req, err := http.NewRequest("GET", API_URL, nil)
	if err != nil {
		return nil, err
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return nil, fmt.Errorf("received status code %d", res.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return nil, err
	}

	var flavors []Flavor
	flavorSelector := doc.Find("ul.ModuleFotdAllFlavors li")
	for index := range flavorSelector.Nodes {
		selection := flavorSelector.Eq(index)

		name := selection.Find("span").Text()

		// Match any non-alphabetic characters
		re := regexp.MustCompile(`[^a-zA-Z\s]+`)
		slug := re.ReplaceAllString(name, "")

		// Match any whitespace characters
		re = regexp.MustCompile(`\s+`)
		slug = strings.ToLower(re.ReplaceAllString(slug, "-"))

		flavor := Flavor{
			Name: name,
			ImageUrl: fmt.Sprintf("https:%s", func() string {
				if src, exists := selection.Find("img").Attr("src"); exists {
					return strings.Replace(src, "180", "400", 1)
				}

				return LOGO_SVG_SRC
			}()),
			Slug: slug,
		}

		flavors = append(flavors, flavor)
	}

	return flavors, nil
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
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

	flavors, err := scrapeFlavors(&http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	})
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("{\"message\": \"%s\"}", err.Error()),
		}, nil
	}

	body, err := json.Marshal(flavors)
	if err != nil {
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
