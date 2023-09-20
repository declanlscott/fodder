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

func TestScrapeFlavor(t *testing.T) {
	contents, err := getMockResponse("flavor.mock.html")
	if err != nil {
		t.Error(err)
		return
	}

	mockClient := &MockHttpClient{
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
