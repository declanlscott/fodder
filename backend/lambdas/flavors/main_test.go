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

	expectedJson := `[{"name":"Andes Mint Avalanche","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Andes-Mint-Avalanche-updated.png?w=400","slug":"andes-mint-avalanche"},{"name":"Blackberry Cobbler","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Blackberry-Cobbler1.png?w=400","slug":"blackberry-cobbler"},{"name":"Butter Pecan","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Butter-Pecan-New.png?w=400","slug":"butter-pecan"},{"name":"Cappuccino Cookie Crumble","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Cappuccino-Cookie-Crumble.png?w=400","slug":"cappuccino-cookie-crumble"},{"name":"Caramel Cashew","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Cashew.png?w=400","slug":"caramel-cashew"},{"name":"Caramel Chocolate Pecan","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Chocolate-Pecan3.png?w=400","slug":"caramel-chocolate-pecan"},{"name":"Caramel Fudge Cookie Dough","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Fudge-CookieDough.png?w=400","slug":"caramel-fudge-cookie-dough"},{"name":"Caramel Peanut Buttercup","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-PB-Cup.Waffle-Cone.png?w=400","slug":"caramel-peanut-buttercup"},{"name":"Caramel Pecan","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Pecan.png?w=400","slug":"caramel-pecan"},{"name":"Caramel Turtle","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Turtle.Waffle-Cone.png?w=400","slug":"caramel-turtle"},{"name":"Chocolate Caramel Twist","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Chocolate-Caramel-Twist2.png?w=400","slug":"chocolate-caramel-twist"},{"name":"Chocolate Covered Strawberry","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Chocolate-Covered-Strawberry1.png?w=400","slug":"chocolate-covered-strawberry"},{"name":"Chocolate Heath Crunch","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Choc-Heath-Crunch.Cake-Cone.png?w=400","slug":"chocolate-heath-crunch"},{"name":"Chocolate Volcano","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Chocolate-Volcano2.png?w=400","slug":"chocolate-volcano"},{"name":"Crazy for Cookie Dough","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Crazy-for-Cookie-Dough.Waffle-Cone1.png?w=400","slug":"crazy-for-cookie-dough"},{"name":"Creamy Lemon Crumble","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Creamy-Lemon-Crumble-Waffle1.png?w=400","slug":"creamy-lemon-crumble"},{"name":"Dark Chocolate Decadence","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Dark-Chocolate-Decadence1.png?w=400","slug":"dark-chocolate-decadence"},{"name":"Dark Chocolate PB Crunch","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Dark-Chocolate-PB-Crunch12.png?w=400","slug":"dark-chocolate-pb-crunch"},{"name":"Devil's Food Cake","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Devils-Food-Cake.png?w=400","slug":"devils-food-cake"},{"name":"Double Strawberry","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Double-Strawberry.Waffle-Cone.png?w=400","slug":"double-strawberry"},{"name":"Espresso Toffee Bar","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Espresso-Toffee-Bar.Waffle-Cone.png?w=400","slug":"espresso-toffee-bar"},{"name":"Georgia Peach","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Georgia-Peach1.png?w=400","slug":"georgia-peach"},{"name":"Lemon Berry Layer Cake","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Lemon-Berry-Layer-Cake.png?w=400","slug":"lemon-berry-layer-cake"},{"name":"Midnight Toffee","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Midnight-Toffee1.png?w=400","slug":"midnight-toffee"},{"name":"Mint Cookie","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Mint-Oreo-updated.png?w=400","slug":"mint-cookie"},{"name":"Mint Explosion","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Mint-Explosion.Cake-Cone-updated.png?w=400","slug":"mint-explosion"},{"name":"OREO® Cookie Cheesecake","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Oreo-Cheesecake.Waffle-Cone1.png?w=400","slug":"oreo-cookie-cheesecake"},{"name":"OREO® Cookie Overload","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Oreo-Overload.png?w=400","slug":"oreo-cookie-overload"},{"name":"Peach Crisp","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Peach-Crisp.Waffle-Cone.png?w=400","slug":"peach-crisp"},{"name":"Raspberry Cheesecake","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Raspberry-Cheesecake.Waffle-Cone.png?w=400","slug":"raspberry-cheesecake"},{"name":"Really Reese's","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Really-Reeses.Cake-Cone.png?w=400","slug":"really-reeses"},{"name":"Red Raspberry","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Red-Raspberry.Waffle-Cone.png?w=400","slug":"red-raspberry"},{"name":"Salted Caramel Pecan Pie","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Salted-Caramel-Pecan-Pie.png?w=400","slug":"Salted Caramel Pecan Pie"},{"name":"Salted Double Caramel Pecan","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Salted-Double-Caramel-Pecan.Cake-Cone.png?w=400","slug":"salted-double-caramel-pecan"},{"name":"Snickers Swirl","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Snicker-Swirl.png?w=400","slug":"snickers-swirl"},{"name":"Strawberry Chocolate Parfait","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Strawberry-Chocolate-Parfait.png?w=400","slug":"Strawberry Chocolate Parfait"},{"name":"Turtle","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Turtle.png?w=400","slug":"turtle"},{"name":"Turtle Cheesecake","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Turtle-Cheesecake.Cake-Cone2.png?w=400","slug":"turtle-cheesecake"},{"name":"Turtle Dove","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Turtle-Dove2.png?w=400","slug":"turtle-dove"}]`

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
