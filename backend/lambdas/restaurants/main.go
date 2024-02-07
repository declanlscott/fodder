package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
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

const BaseImageUrl = "https://cdn.culvers.com/menu-item-detail"
const LogoSvgUrl = "https://cdn.culvers.com/layout/logo.svg"

type ExternalApiResponse struct {
	IsSuccessful bool   `json:"isSuccessful"`
	Message      string `json:"message"`
	Data         struct {
		Meta struct {
			Code int `json:"code"`
		} `json:"meta"`
		Geofences []struct {
			Id          string `json:"_id"`
			Live        bool   `json:"live"`
			Description string `json:"description"`
			Metadata    struct {
				DineInHours         string `json:"dineInHours"`
				DriveThruHours      string `json:"driveThruHours"`
				OnlineOrderStatus   int    `json:"onlineOrderStatus"`
				FlavorOfDayName     string `json:"flavorOfDayName"`
				FlavorOfDaySlug     string `json:"flavorOfDaySlug"`
				OpenDate            string `json:"openDate"`
				IsTemporarilyClosed bool   `json:"isTemporarilyClosed"`
				UtcOffset           int    `json:"utcOffset"`
				Street              string `json:"street"`
				State               string `json:"state"`
				City                string `json:"city"`
				PostalCode          string `json:"postalCode"`
				OloId               string `json:"oloId"`
				Slug                string `json:"slug"`
				JobSearchUrl        string `json:"jobSearchUrl"`
				HandoffOptions      string `json:"handoffOptions"`
			} `json:"metadata"`
			Tag            string `json:"tag"`
			ExternalId     string `json:"externalId"`
			Type           string `json:"type"`
			GeometryCenter struct {
				Type        string    `json:"type"`
				Coordinates []float64 `json:"coordinates"`
			}
			GeometryRadius int `json:"geometryRadius"`
			Geometry       struct {
				Type        string        `json:"type"`
				Coordinates [][][]float64 `json:"coordinates"`
			}
			Enabled bool `json:"enabled"`
		} `json:"geofences"`
		TotalResults int `json:"totalResults"`
	} `json:"data"`
}

type Restaurant struct {
	Name      string  `json:"name"`
	Address   string  `json:"address"`
	City      string  `json:"city"`
	State     string  `json:"state"`
	ZipCode   string  `json:"zipCode"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Slug      string  `json:"slug"`
	Fod       Fod     `json:"fod"`
}

type Fod struct {
	Name     string `json:"name"`
	ImageUrl string `json:"imageUrl"`
	Slug     string `json:"slug"`
}

func getRestaurants(externalApiUrl string, client HttpClient) ([]Restaurant, error) {
	req, err := http.NewRequest("GET", externalApiUrl, nil)
	if err != nil {
		return nil, err
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	var externalApiResponse ExternalApiResponse
	if err := json.Unmarshal(body, &externalApiResponse); err != nil {
		return nil, err
	}

	var restaurants []Restaurant
	for _, location := range externalApiResponse.Data.Geofences {
		fodName := location.Metadata.FlavorOfDayName

		// Match any non-alphabetic characters
		re := regexp.MustCompile(`[^a-zA-Z\s]+`)
		fodSlug := re.ReplaceAllString(fodName, "")

		// Match any whitespace characters
		re = regexp.MustCompile(`\s+`)
		fodSlug = strings.ToLower(re.ReplaceAllString(fodSlug, "-"))

		fod := Fod{
			Name: fodName,
			ImageUrl: func() string {
				slug := location.Metadata.FlavorOfDaySlug
				if slug == "" {
					return LogoSvgUrl
				}

				return fmt.Sprintf(
					"%s/%s",
					BaseImageUrl,
					slug,
				)
			}(),
			Slug: fodSlug,
		}

		restaurant := Restaurant{
			Name:      fmt.Sprintf("Culver's of %s", location.Description),
			Address:   location.Metadata.Street,
			City:      location.Metadata.City,
			State:     location.Metadata.State,
			ZipCode:   location.Metadata.PostalCode,
			Longitude: location.GeometryCenter.Coordinates[0],
			Latitude:  location.GeometryCenter.Coordinates[1],
			Slug:      location.Metadata.Slug,
			Fod:       fod,
		}

		restaurants = append(restaurants, restaurant)
	}

	return restaurants, nil
}

const ExternalApiBaseUrl = "https://www.culvers.com/api"

func handler(_ context.Context, request events.LambdaFunctionURLRequest) (events.LambdaFunctionURLResponse, error) {
	headers := map[string]string{
		"Content-Type":                     "application/json",
		"Access-Control-Allow-Origin":      "*",
		"Access-Control-Allow-Headers":     "Content-Type",
		"Access-Control-Allow-Methods":     "GET",
		"Access-Control-Allow-Credentials": "true",
	}

	params := url.Values{
		"limit": {"1000"},
	}

	var restaurants []Restaurant
	var restaurantsErr error

	if address, ok := request.QueryStringParameters["address"]; ok {
		params.Add("location", address)
	} else {
		latitude, latOk := request.QueryStringParameters["latitude"]
		longitude, longOk := request.QueryStringParameters["longitude"]

		if !latOk || !longOk {
			return events.LambdaFunctionURLResponse{
				StatusCode: http.StatusBadRequest,
				Headers:    headers,
				Body:       "{\"message\": \"Missing latitude/longitude\"}",
			}, nil
		}

		params.Add("lat", latitude)
		params.Add("long", longitude)
	}

	restaurants, restaurantsErr = getRestaurants(
		fmt.Sprintf("%s/restaurants/getLocations?%s", ExternalApiBaseUrl, params.Encode()),
		http.DefaultClient,
	)

	if restaurantsErr != nil {
		return events.LambdaFunctionURLResponse{
			StatusCode: http.StatusInternalServerError,
			Headers:    headers,
			Body:       fmt.Sprintf("{\"message\": \"%s\"}", restaurantsErr.Error()),
		}, nil
	}
	if restaurants == nil {
		return events.LambdaFunctionURLResponse{
			StatusCode: http.StatusNoContent,
			Headers:    headers,
		}, nil
	}

	body, err := json.Marshal(restaurants)
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
