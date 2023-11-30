package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

type HttpClient interface {
	Do(req *http.Request) (*http.Response, error)
}

type ExternalApiResponse struct {
	Collection struct {
		Address     string `json:"Address"`
		CenterPoint string `json:"CenterPoint"`
		City        string `json:"City"`
		Count       int    `json:"Count"`
		Country     string `json:"Country"`
		Locations   []struct {
			Address          string      `json:"Address"`
			Address2         string      `json:"Address2"`
			Adi              string      `json:"Adi"`
			Cfsifml          string      `json:"Cfsifml"`
			Cfsijml          string      `json:"Cfsijml"`
			Cfsiml           string      `json:"Cfsiml"`
			Cfsimml          string      `json:"Cfsimml"`
			Cfsipml          string      `json:"Cfsipml"`
			City             string      `json:"City"`
			Country          string      `json:"Country"`
			DateOpen         string      `json:"DateOpen"`
			Distance         float64     `json:"Distance"`
			DistanceUnit     string      `json:"DistanceUnit"`
			Email            string      `json:"Email"`
			FacebookPlaceUrl string      `json:"FacebookPlaceUrl"`
			Fax              string      `json:"Fax"`
			Fbp              string      `json:"Fbp"`
			FbpEmail         string      `json:"FbpEmail"`
			FlavorDay        string      `json:"FlavorDay"`
			FlavorId         interface{} `json:"FlavorId"`
			FlavorImageUrl   string      `json:"FlavorImageUrl"`
			FridayClose      string      `json:"FridayClose"`
			FridayOpen       string      `json:"FridayOpen"`
			Icon             string      `json:"Icon"`
			Id               int         `json:"Id"`
			JobApplyEmail    string      `json:"JobApplyEmail"`
			JobSearchField   string      `json:"JobSearchField"`
			Latitude         string      `json:"Latitude"`
			Longitude        string      `json:"Longitude"`
			MondayClose      string      `json:"MondayClose"`
			MondayOpen       string      `json:"MondayOpen"`
			Name             string      `json:"Name"`
			OpsMrkt          string      `json:"OpsMrkt"`
			OtherAddress     string      `json:"OtherAddress"`
			Owner            string      `json:"Owner"`
			Phone            string      `json:"Phone"`
			Postal           string      `json:"Postal"`
			Province         string      `json:"Province"`
			SaturdayClose    string      `json:"SaturdayClose"`
			SaturdayOpen     string      `json:"SaturdayOpen"`
			SignalCampaignId string      `json:"SignalCampaignId"`
			State            string      `json:"State"`
			StoreNumber      string      `json:"StoreNumber"`
			SundayClose      string      `json:"SundayClose"`
			SundayOpen       string      `json:"SundayOpen"`
			ThursdayClose    string      `json:"ThursdayClose"`
			ThursdayOpen     string      `json:"ThursdayOpen"`
			TuesdayClose     string      `json:"TuesdayClose"`
			TuesdayOpen      string      `json:"TuesdayOpen"`
			Type             string      `json:"Type"`
			Uid              string      `json:"Uid"`
			Url              string      `json:"Url"`
			UrlSlug          string      `json:"UrlSlug"`
			WednesdayClose   string      `json:"WednesdayClose"`
			WednesdayOpen    string      `json:"WednesdayOpen"`
		} `json:"Locations"`
		Name     string `json:"Name"`
		Postal   string `json:"Postal"`
		Province string `json:"Province"`
		Radius   int    `json:"Radius"`
		State    string `json:"State"`
	}
	ErrorCode    string `json:"ErrorCode"`
	ErrorMessage string `json:"ErrorMessage"`
}

type Restaurant struct {
	Name      string  `json:"name"`
	Address   string  `json:"address"`
	City      string  `json:"city"`
	State     string  `json:"state"`
	Country   string  `json:"country"`
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
	for _, location := range externalApiResponse.Collection.Locations {
		latitude, _ := strconv.ParseFloat(location.Latitude, 64)
		longitude, _ := strconv.ParseFloat(location.Longitude, 64)

		fodImageUrl := location.FlavorImageUrl
		if index := strings.Index(location.FlavorImageUrl, "?"); index != -1 {
			fodImageUrl = location.FlavorImageUrl[:index]
		}

		slug := strings.Replace(location.Url, "http://www.culvers.com/restaurants/", "", 1)

		fodName := location.FlavorDay

		// Match any non-alphabetic characters
		re := regexp.MustCompile(`[^a-zA-Z\s]+`)
		fodSlug := re.ReplaceAllString(fodName, "")

		// Match any whitespace characters
		re = regexp.MustCompile(`\s+`)
		fodSlug = strings.ToLower(re.ReplaceAllString(fodSlug, "-"))

		fod := Fod{
			Name:     fodName,
			ImageUrl: fodImageUrl,
			Slug:     fodSlug,
		}

		restaurant := Restaurant{
			Name:      location.Name,
			Address:   location.Address,
			City:      location.City,
			State:     location.State,
			Country:   location.Country,
			ZipCode:   location.Postal,
			Latitude:  latitude,
			Longitude: longitude,
			Slug:      slug,
			Fod:       fod,
		}

		restaurants = append(restaurants, restaurant)
	}

	return restaurants, nil
}

const EXTERNAL_API_BASE_URL = "https://www.culvers.com/api"

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

	if radius, ok := request.QueryStringParameters["radius"]; !ok {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Headers:    headers,
			Body:       "{\"message\": \"Missing radius\"}",
		}, nil
	} else {
		params := url.Values{}

		params.Add("searchRadius", radius)
		params.Add("proximitySearchMethod", "drivetime")
		params.Add("cuttoff", "100")
		params.Add("limit", "1000")

		var restaurants []Restaurant
		var restaurantsErr error

		if address, ok := request.QueryStringParameters["address"]; ok {
			params.Add("address", address)

			restaurants, restaurantsErr = getRestaurants(
				fmt.Sprintf("%s/locate/address/json?%s", EXTERNAL_API_BASE_URL, params.Encode()),
				http.DefaultClient,
			)
		} else {
			latitude, latOk := request.QueryStringParameters["latitude"]
			longitude, longOk := request.QueryStringParameters["longitude"]

			if !latOk || !longOk {
				return events.APIGatewayProxyResponse{
					StatusCode: http.StatusBadRequest,
					Headers:    headers,
					Body:       "{\"message\": \"Missing latitude/longitude\"}",
				}, nil
			}

			params.Add("latitude", latitude)
			params.Add("longitude", longitude)

			restaurants, restaurantsErr = getRestaurants(
				fmt.Sprintf("%s/locate/latlong/json?%s", EXTERNAL_API_BASE_URL, params.Encode()),
				http.DefaultClient,
			)
		}

		if restaurantsErr != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusInternalServerError,
				Headers:    headers,
				Body:       fmt.Sprintf("{\"message\": \"%s\"}", restaurantsErr.Error()),
			}, nil
		}
		if restaurants == nil {
			return events.APIGatewayProxyResponse{
				StatusCode: http.StatusNoContent,
				Headers:    headers,
			}, nil
		}

		body, err := json.Marshal(restaurants)
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
}

func main() {
	lambda.Start(handler)
}
