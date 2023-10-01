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

func TestScrapeFlavor(t *testing.T) {
	contents, err := utils.GetMockResponse("flavor.mock.html")
	if err != nil {
		t.Error(err)
		return
	}

	mockClient := &utils.MockHttpClient{
		Response: &http.Response{
			StatusCode: 200,
			Body:       io.NopCloser(bytes.NewReader(contents)),
		},
	}

	flavor, err := scrapeFlavor("devils-food-cake", mockClient)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
		return
	}

	expectedJson := `{"name":"Devil’s Food Cake","description":"Dark Chocolate Fresh Frozen Custard swirled with chocolate cake and novelty chocolate.","imageUrl":"https:./flavor_files/img-Devils-Food-Cake.png","allergens":["Soy","Milk","Egg","Wheat/Gluten"]}`

	actualJson, err := json.Marshal(flavor)
	if err != nil {
		t.Errorf("Expected no error, but got %v", err)
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
		30,
		16,
		0,
		0,
		0,
		time.UTC,
	)
	expirationDuration := getExpirationDuration(currentTime)
	if expectedExpirationDuration := "8h0m0s"; expirationDuration.String() != expectedExpirationDuration {
		t.Errorf(
			"Expected expiration duration of %s, but got %s",
			expectedExpirationDuration,
			expirationDuration.String(),
		)
	}

	currentTime = time.Date(
		2023,
		time.October,
		1,
		8,
		0,
		0,
		0,
		time.UTC,
	)
	expirationDuration = getExpirationDuration(currentTime)
	if expectedExpirationDuration := "160h0m0s"; expirationDuration.String() != expectedExpirationDuration {
		t.Errorf(
			"Expected expiration duration of %s, but got %s",
			expectedExpirationDuration,
			expirationDuration.String(),
		)
	}
}

func TestHandler(t *testing.T) {
	ctx := context.Background()

	res, err := handler(ctx, events.APIGatewayProxyRequest{
		PathParameters: map[string]string{
			"slug": "devils-food-cake",
		},
	})
	if err != nil {
		t.Error(err)
	}

	fmt.Println(res.Body)
}
