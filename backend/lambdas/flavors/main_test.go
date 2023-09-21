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

func TestScrapeFlavors(t *testing.T) {
	contents, err := utils.GetMockResponse("flavors.mock.html")
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

	flavors, err := scrapeFlavors(mockClient)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
		return
	}

	expectedJson := `[{"name":"Andes Mint Avalanche","imageUrl":"https:./flavors_files/img-Andes-Mint-Avalanche-updated.png"},{"name":"Blackberry Cobbler","imageUrl":"https:./flavors_files/img-Blackberry-Cobbler1.png"},{"name":"Brownie Batter Overload","imageUrl":"https:./flavors_files/img-Brownie-Batter-Overload.Waffle-Cone.png"},{"name":"Butter Pecan","imageUrl":"https:./flavors_files/img-Butter-Pecan-New.png"},{"name":"Cappuccino Cookie Crumble","imageUrl":"https:./flavors_files/img-Cappuccino-Cookie-Crumble.png"},{"name":"Caramel Cashew","imageUrl":"https:./flavors_files/img-Caramel-Cashew.png"},{"name":"Caramel Chocolate Pecan","imageUrl":"https:./flavors_files/img-Caramel-Chocolate-Pecan3.png"},{"name":"Caramel Fudge Cookie Dough","imageUrl":"https:./flavors_files/img-Caramel-Fudge-CookieDough.png"},{"name":"Caramel Peanut Buttercup","imageUrl":"https:./flavors_files/img-Caramel-PB-Cup.Waffle-Cone.png"},{"name":"Caramel Pecan","imageUrl":"https:./flavors_files/img-Caramel-Pecan.png"},{"name":"Caramel Turtle","imageUrl":"https:./flavors_files/img-Caramel-Turtle.Waffle-Cone.png"},{"name":"Chocolate Caramel Twist","imageUrl":"https:./flavors_files/img-Chocolate-Caramel-Twist2.png"},{"name":"Chocolate Covered Strawberry","imageUrl":"https:./flavors_files/img-Chocolate-Covered-Strawberry1.png"},{"name":"Chocolate Eclair","imageUrl":"https:./flavors_files/img-Chocolate-EClair.Waffle-Cone.png"},{"name":"Chocolate Heath Crunch","imageUrl":"https:./flavors_files/img-Choc-Heath-Crunch.Cake-Cone.png"},{"name":"Chocolate Volcano","imageUrl":"https:./flavors_files/img-Chocolate-Volcano2.png"},{"name":"Crazy for Cookie Dough","imageUrl":"https:./flavors_files/img-Crazy-for-Cookie-Dough.Waffle-Cone1.png"},{"name":"Creamy Lemon Crumble","imageUrl":"https:./flavors_files/img-Creamy-Lemon-Crumble-Waffle1.png"},{"name":"Dark Chocolate Decadence","imageUrl":"https:./flavors_files/img-Dark-Chocolate-Decadence1.png"},{"name":"Dark Chocolate PB Crunch","imageUrl":"https:./flavors_files/img-Dark-Chocolate-PB-Crunch12.png"},{"name":"Devil's Food Cake","imageUrl":"https:./flavors_files/img-Devils-Food-Cake.png"},{"name":"Double Strawberry","imageUrl":"https:./flavors_files/img-Double-Strawberry.Waffle-Cone.png"},{"name":"Dulce de Leche Cheesecake","imageUrl":"https:./flavors_files/img-Dulce-de-Leche1.png"},{"name":"Espresso Toffee Bar","imageUrl":"https:./flavors_files/img-Espresso-Toffee-Bar.Waffle-Cone.png"},{"name":"Georgia Peach","imageUrl":"https:./flavors_files/img-Georgia-Peach1.png"},{"name":"Lemon Berry Layer Cake","imageUrl":"https:./flavors_files/img-Lemon-Berry-Layer-Cake.png"},{"name":"Midnight Toffee","imageUrl":"https:./flavors_files/img-Midnight-Toffee1.png"},{"name":"Mint Cookie","imageUrl":"https:./flavors_files/img-Mint-Oreo-updated.png"},{"name":"Mint Explosion","imageUrl":"https:./flavors_files/img-Mint-Explosion.Cake-Cone-updated.png"},{"name":"OREO® Cookie Cheesecake","imageUrl":"https:./flavors_files/img-Oreo-Cheesecake.Waffle-Cone1.png"},{"name":"OREO® Cookie Overload","imageUrl":"https:./flavors_files/img-Oreo-Overload.png"},{"name":"Peach Crisp","imageUrl":"https:./flavors_files/img-Peach-Crisp.Waffle-Cone.png"},{"name":"Pumpkin Pecan","imageUrl":"https:./flavors_files/img-pumpkin-pecan.png"},{"name":"Raspberry Cheesecake","imageUrl":"https:./flavors_files/img-Raspberry-Cheesecake.Waffle-Cone.png"},{"name":"Really Reese's","imageUrl":"https:./flavors_files/img-Really-Reeses.Cake-Cone.png"},{"name":"Red Raspberry","imageUrl":"https:./flavors_files/img-Red-Raspberry.Waffle-Cone.png"},{"name":"Salted Caramel Pecan Pie","imageUrl":"https:./flavors_files/img-Salted-Caramel-Pecan-Pie.png"},{"name":"Salted Double Caramel Pecan","imageUrl":"https:./flavors_files/img-Salted-Double-Caramel-Pecan.Cake-Cone.png"},{"name":"Snickers Swirl","imageUrl":"https:./flavors_files/img-Snicker-Swirl.png"},{"name":"Strawberry Chocolate Parfait","imageUrl":"https:./flavors_files/img-Strawberry-Chocolate-Parfait.png"},{"name":"Turtle","imageUrl":"https:./flavors_files/img-Turtle.png"},{"name":"Turtle Cheesecake","imageUrl":"https:./flavors_files/img-Turtle-Cheesecake.Cake-Cone2.png"},{"name":"Turtle Dove","imageUrl":"https:./flavors_files/img-Turtle-Dove2.png"}]`

	actualJson, err := json.Marshal(flavors)
	if err != nil {
		t.Errorf("Expected no error, but got %v", err)
	}

	if !reflect.DeepEqual(string(actualJson), expectedJson) {
		t.Errorf("Expected JSON: %v\nActual JSON: %v", expectedJson, string(actualJson))
		return
	}
}

func TestHandler(t *testing.T) {
	ctx := context.Background()

	res, err := handler(ctx, events.APIGatewayProxyRequest{})
	if err != nil {
		t.Error(err)
	}

	fmt.Println(res.Body)
}
