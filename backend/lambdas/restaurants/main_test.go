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

	"github.com/aws/aws-lambda-go/events"
	"github.com/dscott1008/fodder/backend/utils"
)

type MockHttpClient struct {
	Response *http.Response
	Error    error
}

func (mockHttpClient *MockHttpClient) Do(req *http.Request) (*http.Response, error) {
	return mockHttpClient.Response, mockHttpClient.Error
}

func TestGetRestaurants(t *testing.T) {
	contents, err := utils.GetMockResponse("restaurants.mock.json")
	if err != nil {
		t.Errorf("Expected no error, but got %v", err)
		return
	}

	mockClient := &MockHttpClient{
		Response: &http.Response{
			StatusCode: 200,
			Body:       io.NopCloser(bytes.NewReader(contents)),
		},
		Error: nil,
	}

	restaurants, err := getRestaurants("https://example.com/api", mockClient)
	if err != nil {
		t.Errorf("Expected no error, but got %v", err)
	}

	actualJson, err := json.Marshal(restaurants)
	if err != nil {
		t.Errorf("Expected no error, but got %v", err)
	}

	expectedJson := `[{"name":"Culver's of Marion, IA - Red Fox Way","address":"1375 Red Fox Way","city":"Marion","state":"IA","zipCode":"52302","latitude":42.038490295410156,"longitude":-91.55107879638672,"slug":"marion","fod":{"name":"Salted Double Caramel Pecan","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Salted-Double-Caramel-Pecan.Cake-Cone.png","slug":"salted-double-caramel-pecan"}},{"name":"Culver's of Hiawatha, IA - N Center Point Rd","address":"1005 N Center Point Rd","city":"Hiawatha","state":"IA","zipCode":"52233","latitude":42.0482177734375,"longitude":-91.68312072753906,"slug":"hiawatha","fod":{"name":"Devil's Food Cake","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Devils-Food-Cake.png","slug":"devils-food-cake"}},{"name":"Culver's of Cedar Rapids, IA - Edgewood Rd SW","address":"2405 Edgewood Rd SW","city":"Cedar Rapids","state":"IA","zipCode":"52404","latitude":41.95463180541992,"longitude":-91.71552276611328,"slug":"cedar-rapids","fod":{"name":"Cappuccino Cookie Crumble","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Cappuccino-Cookie-Crumble.png","slug":"cappuccino-cookie-crumble"}},{"name":"Culver's of Coralville, IA - Heartland Pl","address":"2591 Heartland Pl","city":"Coralville","state":"IA","zipCode":"52241","latitude":41.70014572143555,"longitude":-91.60919189453125,"slug":"coralville","fod":{"name":"Caramel Fudge Cookie Dough","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Fudge-CookieDough.png","slug":"caramel-fudge-cookie-dough"}}]`
	if !reflect.DeepEqual(string(actualJson), expectedJson) {
		t.Errorf("Expected JSON: %v\nActual JSON: %v", expectedJson, string(actualJson))
	}
}

func TestHandler(t *testing.T) {
	ctx := context.Background()

	res, err := handler(ctx, events.APIGatewayProxyRequest{
		QueryStringParameters: map[string]string{
			"address": "marion, ia",
		},
	})
	if err != nil {
		t.Error(err)
	}

	fmt.Println(res.Body)
}
