package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"io"
	"net/http"
	"os"
	"reflect"
	"strings"
	"testing"
)

type MockHttpClient struct {
	Response *http.Response
	Error    error
}

func (mockHttpClient *MockHttpClient) Do(req *http.Request) (*http.Response, error) {
	return mockHttpClient.Response, mockHttpClient.Error
}

func TestScrapeRestaurantWithMockResponse(t *testing.T) {
	file, err := os.Open("mock_response.html")
	if err != nil {
		t.Error(err)
		return
	}
	defer file.Close()

	contents, err := io.ReadAll(file)
	if err != nil {
		t.Error(err)
		return
	}

	mockClient := &MockHttpClient{
		Response: &http.Response{
			StatusCode: 200,
			Body:       io.NopCloser(strings.NewReader(string(contents))),
		},
		Error: nil,
	}

	actualJson, err := scrapeRestaurant("marion", mockClient)
	if err != nil {
		t.Errorf("Expected no error, but %v", err)
	}

	expectedJson := `{"location":"Marion, IA - Red Fox Way","flavors":[{"date":"Tuesday, September 19","name":"Chocolate Covered Strawberry","imageUrl":"https:./test_response_files/img-Chocolate-Covered-Strawberry1(1).png"},{"date":"Wednesday, September 20","name":"Dulce de Leche Cheesecake","imageUrl":"https:./test_response_files/img-Dulce-de-Leche1.png"},{"date":"Thursday, September 21","name":"Georgia Peach","imageUrl":"https:./test_response_files/img-Georgia-Peach1.png"},{"date":"Friday, September 22","name":"Espresso Toffee Bar","imageUrl":"https:./test_response_files/img-Espresso-Toffee-Bar.Waffle-Cone.png"},{"date":"Saturday, September 23","name":"Turtle Cheesecake","imageUrl":"https:./test_response_files/img-Turtle-Cheesecake.Cake-Cone2.png"}]}`

	if !reflect.DeepEqual(actualJson, expectedJson) {
		t.Errorf("Expected JSON: %v\nActual JSON: %v", expectedJson, actualJson)
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
