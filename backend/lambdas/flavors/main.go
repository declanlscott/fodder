package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"time"

	"fodder/backend/utils/expires"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type HttpClient interface {
	Do(req *http.Request) (*http.Response, error)
}

const ApiUrl = "https://www.culvers.com/flavor-of-the-day"
const BaseImageUrl = "https://cdn.culvers.com/menu-item-detail"

type NextData struct {
	Props struct {
		PageProps struct {
			Page struct {
				Zones struct {
					Content []struct {
						ModuleName string `json:"moduleName"`
						CustomData struct {
							Flavors []struct {
								IdFlavor          int    `json:"idFlavor"`
								IdMenuItem        int    `json:"idMenuItem"`
								LongFlavorName    string `json:"longFlavorName"`
								FileName          string `json:"fileName"`
								FlavorDescription string `json:"flavorDescription"`
								LongDescription   string `json:"longDescription"`
								FlavorName        string `json:"flavorName"`
								FlavorCategories  []struct {
									Id   int    `json:"id"`
									Name string `json:"name"`
								}
								FlavorNameLocalized    string `json:"flavorNameLocalized"`
								FotdImage              string `json:"fotdImage"`
								FotdUrlSlug            string `json:"fotdUrlSlug"`
								FlavorNameSpanish      string `json:"flavorNameSpanish"`
								FotdDescriptionSpanish string `json:"fotdDescriptionSpanish"`
							} `json:"flavors"`
						} `json:"customData"`
					} `json:"content"`
				} `json:"zones"`
			} `json:"page"`
		} `json:"pageProps"`
	} `json:"props"`
}

type Flavor struct {
	Name     string `json:"name"`
	ImageUrl string `json:"imageUrl"`
	Slug     string `json:"slug"`
}

func scrapeFlavors(client HttpClient) ([]Flavor, error) {
	req, err := http.NewRequest("GET", ApiUrl, nil)
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

	flavorsProps := nextData.Props.PageProps.Page.Zones.Content
	index := 0
	for _, content := range flavorsProps {
		if content.ModuleName == "FlavorOfTheDayAllFlavors" {
			break
		}
		index += 1
	}
	if index == len(flavorsProps) {
		return nil, errors.New("could not find flavors")
	}

	var flavor Flavor
	var flavors []Flavor
	for _, flavorProps := range flavorsProps[index].CustomData.Flavors {
		flavor = Flavor{
			Name: flavorProps.FlavorName,
			ImageUrl: fmt.Sprintf(
				"%s/%s?%s",
				BaseImageUrl,
				flavorProps.FotdImage,
				url.Values{"w": {"400"}}.Encode(),
			),
			Slug: flavorProps.FotdUrlSlug,
		}

		flavors = append(flavors, flavor)
	}

	return flavors, nil
}

func handler(_ context.Context, request events.LambdaFunctionURLRequest) (events.LambdaFunctionURLResponse, error) {
	headers := map[string]string{
		"Content-Type":                     "application/json",
		"Access-Control-Allow-Origin":      "*",
		"Access-Control-Allow-Headers":     "Content-Type",
		"Access-Control-Allow-Methods":     "GET",
		"Access-Control-Allow-Credentials": "true",
	}

	flavors, err := scrapeFlavors(&http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	})
	if err != nil {
		return events.LambdaFunctionURLResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("{\"message\": \"%s\"}", err.Error()),
		}, nil
	}

	body, err := json.Marshal(flavors)
	if err != nil {
		return events.LambdaFunctionURLResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("{\"message\": \"%s\"}", err.Error()),
		}, nil
	}

	headers["Expires"] = expires.AtMidnight(time.UnixMilli(request.RequestContext.TimeEpoch))
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
