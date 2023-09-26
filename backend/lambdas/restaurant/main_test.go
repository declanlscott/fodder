package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"testing"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/dscott1008/fodder/backend/utils"
)

func TestScrapeRestaurant(t *testing.T) {
	contents, err := utils.GetMockResponse("restaurant.mock.html")
	if err != nil {
		t.Error(err)
		return
	}

	mockClient := &utils.MockHttpClient{
		Response: &http.Response{
			StatusCode: 200,
			Body:       io.NopCloser(bytes.NewReader(contents)),
		},
		Error: nil,
	}

	restaurant, err := scrapeRestaurant("marion", mockClient)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
		return
	}

	expectedJson := `{"location":"Marion, IA - Red Fox Way","flavors":[{"date":"Tuesday, September 19","name":"Chocolate Covered Strawberry","imageUrl":"https:./test_response_files/img-Chocolate-Covered-Strawberry1(1).png"},{"date":"Wednesday, September 20","name":"Dulce de Leche Cheesecake","imageUrl":"https:./test_response_files/img-Dulce-de-Leche1.png"},{"date":"Thursday, September 21","name":"Georgia Peach","imageUrl":"https:./test_response_files/img-Georgia-Peach1.png"},{"date":"Friday, September 22","name":"Espresso Toffee Bar","imageUrl":"https:./test_response_files/img-Espresso-Toffee-Bar.Waffle-Cone.png"},{"date":"Saturday, September 23","name":"Turtle Cheesecake","imageUrl":"https:./test_response_files/img-Turtle-Cheesecake.Cake-Cone2.png"}]}`

	actualJson, err := json.Marshal(restaurant)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
		return
	}

	if !reflect.DeepEqual(string(actualJson), expectedJson) {
		t.Errorf("Expected JSON: %v\nActual JSON: %v", expectedJson, string(actualJson))
		return
	}
}

func TestGetExpirationDuration(t *testing.T) {
	currentTime := time.Date(
		2023,
		time.September,
		26,
		14,
		0,
		0,
		0,
		time.UTC,
	).UTC()
	expirationDuration := getExpirationDuration(currentTime)

	if expectedExpirationDuration := "17h30m0s"; expirationDuration.String() != expectedExpirationDuration {
		t.Errorf(
			"Expected expiration duration to be %s, got %s",
			expectedExpirationDuration,
			expirationDuration.String(),
		)
		return
	}

	currentTime = time.Date(
		2023,
		time.September,
		27,
		8,
		0,
		0,
		0,
		time.UTC,
	).UTC()
	expirationDuration = getExpirationDuration(currentTime)
	if expectedExpirationDuration := "23h30m0s"; expirationDuration.String() != expectedExpirationDuration {
		t.Errorf(
			"Expected expiration duration to be %s, got %s",
			expectedExpirationDuration,
			expirationDuration.String(),
		)
		return
	}
}

func TestHandler(t *testing.T) {
	ctx := context.Background()

	res, err := handler(ctx, events.APIGatewayProxyRequest{
		PathParameters: map[string]string{
			"slug": "marion",
		},
	})
	if err != nil {
		t.Error(err)
	}

	fmt.Println(res.Body)
}
