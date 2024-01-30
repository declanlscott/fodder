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

	"fodder/backend/utils"
	"github.com/aws/aws-lambda-go/events"
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

	expectedJson := `{"name":"Devil’s Food Cake","description":"Dark Chocolate Fresh Frozen Custard swirled with chocolate cake and novelty chocolate.","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Devils-Food-Cake.png","allergens":["Egg","Milk","Soy","Wheat"]}`
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

// TODO: TestGetExpiration

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
