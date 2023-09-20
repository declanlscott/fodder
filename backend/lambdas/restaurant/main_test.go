package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"reflect"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type MockHttpClient struct {
	Response *http.Response
	Error    error
}

func (mockHttpClient *MockHttpClient) Do(req *http.Request) (*http.Response, error) {
	return mockHttpClient.Response, mockHttpClient.Error
}

func getMockResponse(fileName string) ([]byte, error) {
	var file *os.File

	_, err := os.Stat(fileName)
	if err == nil {
		// File exists
		file, err = os.Open(fileName)
		if err != nil {
			// An error occurred while opening the file
			return nil, err
		}
		defer file.Close()

		return io.ReadAll(file)
	} else if os.IsNotExist(err) {
		// File does not exist
		cfg, err := config.LoadDefaultConfig(context.TODO())
		if err != nil {
			return nil, err
		}

		s3Client := s3.NewFromConfig(cfg)

		result, err := s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String("fodder-test-files"),
			Key:    aws.String(fmt.Sprintf("mock-responses/%s", fileName)),
		})
		if err != nil {
			// An error occurred while getting the file from S3
			return nil, err
		}
		defer result.Body.Close()

		file, err = os.Create(fileName)
		if err != nil {
			// An error occurred while creating the file
			return nil, err
		}
		defer file.Close()

		body, err := io.ReadAll(result.Body)
		if err != nil {
			// An error occurred while reading the file from S3
			return nil, err
		}

		_, err = file.Write(body)
		if err != nil {
			// An error occurred while writing the file to disk
			return nil, err
		}

		return body, nil
	} else {
		// An error occurred while checking if the file exists
		return nil, err
	}
}

func TestScrapeRestaurant(t *testing.T) {
	contents, err := getMockResponse("restaurant.mock.html")
	if err != nil {
		t.Error(err)
		return
	}

	mockClient := &MockHttpClient{
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
