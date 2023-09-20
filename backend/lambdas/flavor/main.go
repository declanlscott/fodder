package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"net/http"
	"strings"
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
		return nil, fmt.Errorf("received status code %d", res.StatusCode)
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
			allergensSelector := doc.Find(".ModuleMenuItemDetail-allergens .col-xs-10 ul li")
			for index := range allergensSelector.Nodes {
				selection := allergensSelector.Eq(index)

				allergens = append(allergens, strings.TrimSpace(selection.Text()))
			}

			return allergens
		}(),
	}

	return &flavor, nil
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	slug := request.PathParameters["slug"]

	flavor, err := scrapeFlavor(slug, &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	})
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       err.Error(),
		}, err
	}

	body, err := json.Marshal(flavor)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Body:       err.Error(),
		}, err
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       string(body),
	}, nil
}

func main() {
	lambda.Start(handler)
}
