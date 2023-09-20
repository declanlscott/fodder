package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/PuerkitoBio/goquery"
	"net/http"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type HttpClient interface {
	Do(req *http.Request) (*http.Response, error)
}

const EXTERNAL_API_BASE_URL = "https://www.culvers.com/restaurants"
const LOGO_SVG_SRC = "//cdn.culvers.com/layout/logo.svg"

type Restaurant struct {
	Location string   `json:"location"`
	Flavors  []Flavor `json:"flavors"`
}

type Flavor struct {
	Date     string `json:"date"`
	Name     string `json:"name"`
	ImageUrl string `json:"imageUrl"`
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
		return nil, fmt.Errorf("received status code %d", res.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return nil, err
	}

	today := Flavor{
		Date: strings.TrimSpace(strings.Replace(doc.Find("#upcoming .upperstub h3").Text(), "TODAY –", "", 1)),
		Name: doc.Find("#upcoming .upperstub .content .fotd a").Text(),
		ImageUrl: fmt.Sprintf("https:%s", func() string {
			if src, exists := doc.Find("#upcoming .upperstub img").Attr("src"); exists {
				return strings.Replace(src, "140", "400", 1)
			}

			return LOGO_SVG_SRC
		}()),
	}

	var upcoming []Flavor
	upcomingSelector := doc.Find("#upcoming .lowerstub")
	for index := range upcomingSelector.Nodes {
		selection := upcomingSelector.Eq(index)

		upcoming = append(upcoming, Flavor{
			Date: strings.TrimSpace(strings.Replace(selection.Find("h3").Text(), "TOMORROW –", "", 1)),
			Name: selection.Find(".content .fotd a").Text(),
			ImageUrl: fmt.Sprintf("https:%s", func() string {
				if src, exists := selection.Find("img").Attr("src"); exists {
					return strings.Replace(src, "140", "400", 1)
				}

				return LOGO_SVG_SRC
			}()),
		})
	}

	restaurant := Restaurant{
		Location: strings.TrimSpace(doc.Find(".ModuleContentHeader h1").Text()),
		Flavors:  append([]Flavor{today}, upcoming...),
	}

	return &restaurant, nil
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	slug := request.PathParameters["slug"]

	restaurant, err := scrapeRestaurant(slug, &http.Client{
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

	body, err := json.Marshal(restaurant)
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
