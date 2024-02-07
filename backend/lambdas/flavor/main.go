package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"

	"fodder/backend/utils/expires"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
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

func handler(_ context.Context, request events.LambdaFunctionURLRequest) (events.LambdaFunctionURLResponse, error) {
	parts := strings.Split(request.RawPath, "/")
	slug := parts[len(parts)-1]

	headers := map[string]string{
		"Content-Type":                     "application/json",
		"Access-Control-Allow-Origin":      "*",
		"Access-Control-Allow-Headers":     "Content-Type",
		"Access-Control-Allow-Methods":     "GET",
		"Access-Control-Allow-Credentials": "true",
	}

	flavor, err := scrapeFlavor(slug, &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	})
	if err != nil {
		var scrapeError *ScrapeError
		if errors.As(err, &scrapeError) {
			if scrapeError.StatusCode == http.StatusNotFound {
				return events.LambdaFunctionURLResponse{
					StatusCode: http.StatusNotFound,
					Headers:    headers,
					Body:       fmt.Sprintf("{\"message\": \"Flavor not found.\"}"),
				}, nil
			}
		}
	}

	body, err := json.Marshal(flavor)
	if err != nil {
		return events.LambdaFunctionURLResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("{\"message\": \"%s\"}", err.Error()),
		}, nil
	}

	headers["Expires"] = expires.BeforeOpening(time.UnixMilli(request.RequestContext.TimeEpoch))
	headers["Access-Control-Allow-Headers"] = headers["Access-Control-Allow-Headers"] + ",Expires"

	return events.LambdaFunctionURLResponse{
		StatusCode: http.StatusOK,
		Headers:    headers,
		Body:       string(body),
	}, nil
}

func main() {
	lambda.Start(handler)
}
