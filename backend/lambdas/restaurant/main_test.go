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

	mockRequestTime, _ := time.Parse("02/Jan/2006:15:04:05 -0700", "01/Dec/2023:6:24:55 +0000")
	restaurant, err := scrapeRestaurant("marion", mockRequestTime, mockClient)
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
		return
	}

	expectedJson := `{"name":"Culver's of Marion, IA - Red Fox Way","address":"1375 Red Fox Way","city":"Marion","state":"IA","zipCode":"52302","phoneNumber":"319-373-7575","flavors":[{"date":"2023-12-01T00:00:00","name":"Chocolate Volcano","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Chocolate-Volcano2.png?w=400","slug":"chocolate-volcano"},{"date":"2023-12-02T00:00:00","name":"OREO® Cookie Overload","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Oreo-Overload.png?w=400","slug":"oreo-cookie-overload"},{"date":"2023-12-03T00:00:00","name":"Crazy for Cookie Dough","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Crazy-for-Cookie-Dough.Waffle-Cone1.png?w=400","slug":"crazy-for-cookie-dough"},{"date":"2023-12-04T00:00:00","name":"Caramel Peanut Buttercup","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-PB-Cup.Waffle-Cone.png?w=400","slug":"caramel-peanut-buttercup"},{"date":"2023-12-05T00:00:00","name":"Caramel Pecan","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Pecan.png?w=400","slug":"caramel-pecan"},{"date":"2023-12-06T00:00:00","name":"Salted Double Caramel Pecan","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Salted-Double-Caramel-Pecan.Cake-Cone.png?w=400","slug":"salted-double-caramel-pecan"},{"date":"2023-12-07T00:00:00","name":"Peach Crisp","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Peach-Crisp.Waffle-Cone.png?w=400","slug":"peach-crisp"},{"date":"2023-12-08T00:00:00","name":"Chocolate Caramel Twist","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Chocolate-Caramel-Twist2.png?w=400","slug":"chocolate-caramel-twist"},{"date":"2023-12-09T00:00:00","name":"Caramel Fudge Cookie Dough","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Fudge-CookieDough.png?w=400","slug":"caramel-fudge-cookie-dough"},{"date":"2023-12-10T00:00:00","name":"Caramel Turtle","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Turtle.Waffle-Cone.png?w=400","slug":"caramel-turtle"},{"date":"2023-12-11T00:00:00","name":"Dark Chocolate PB Crunch","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Dark-Chocolate-PB-Crunch12.png?w=400","slug":"dark-chocolate-pb-crunch"},{"date":"2023-12-12T00:00:00","name":"Salted Caramel Pecan Pie","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Salted-Caramel-Pecan-Pie.png?w=400","slug":"Salted Caramel Pecan Pie"},{"date":"2023-12-13T00:00:00","name":"Chocolate Covered Strawberry","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Chocolate-Covered-Strawberry1.png?w=400","slug":"chocolate-covered-strawberry"},{"date":"2023-12-14T00:00:00","name":"Andes Mint Avalanche","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Andes-Mint-Avalanche-updated.png?w=400","slug":"andes-mint-avalanche"},{"date":"2023-12-15T00:00:00","name":"Caramel Cashew","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Cashew.png?w=400","slug":"caramel-cashew"},{"date":"2023-12-16T00:00:00","name":"Chocolate Caramel Twist","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Chocolate-Caramel-Twist2.png?w=400","slug":"chocolate-caramel-twist"},{"date":"2023-12-17T00:00:00","name":"Turtle","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Turtle.png?w=400","slug":"turtle"},{"date":"2023-12-18T00:00:00","name":"Devil's Food Cake","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Devils-Food-Cake.png?w=400","slug":"devils-food-cake"},{"date":"2023-12-19T00:00:00","name":"Snickers Swirl","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Snicker-Swirl.png?w=400","slug":"snickers-swirl"},{"date":"2023-12-20T00:00:00","name":"Mint Explosion","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Mint-Explosion.Cake-Cone-updated.png?w=400","slug":"mint-explosion"},{"date":"2023-12-21T00:00:00","name":"Lemon Berry Layer Cake","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Lemon-Berry-Layer-Cake.png?w=400","slug":"lemon-berry-layer-cake"},{"date":"2023-12-22T00:00:00","name":"Crazy for Cookie Dough","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Crazy-for-Cookie-Dough.Waffle-Cone1.png?w=400","slug":"crazy-for-cookie-dough"},{"date":"2023-12-23T00:00:00","name":"Turtle Dove","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Turtle-Dove2.png?w=400","slug":"turtle-dove"},{"date":"2023-12-24T00:00:00","name":"Espresso Toffee Bar","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Espresso-Toffee-Bar.Waffle-Cone.png?w=400","slug":"espresso-toffee-bar"},{"date":"2023-12-25T00:00:00","name":"z *Restaurant Closed Today","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-fotd-notpictured1.png?w=400","slug":"z-restaurant-closed-today"},{"date":"2023-12-26T00:00:00","name":"Butter Pecan","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Butter-Pecan-New.png?w=400","slug":"butter-pecan"},{"date":"2023-12-27T00:00:00","name":"Blackberry Cobbler","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Blackberry-Cobbler1.png?w=400","slug":"blackberry-cobbler"},{"date":"2023-12-28T00:00:00","name":"Salted Caramel Pecan Pie","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Salted-Caramel-Pecan-Pie.png?w=400","slug":"Salted Caramel Pecan Pie"},{"date":"2023-12-29T00:00:00","name":"Turtle","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Turtle.png?w=400","slug":"turtle"},{"date":"2023-12-30T00:00:00","name":"Caramel Fudge Cookie Dough","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Fudge-CookieDough.png?w=400","slug":"caramel-fudge-cookie-dough"},{"date":"2023-12-31T00:00:00","name":"Caramel Cashew","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Caramel-Cashew.png?w=400","slug":"caramel-cashew"},{"date":"2024-01-01T00:00:00","name":"Espresso Toffee Bar","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Espresso-Toffee-Bar.Waffle-Cone.png?w=400","slug":"espresso-toffee-bar"},{"date":"2024-01-05T00:00:00","name":"Chocolate Heath Crunch","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Choc-Heath-Crunch.Cake-Cone.png?w=400","slug":"chocolate-heath-crunch"},{"date":"2024-01-06T00:00:00","name":"Blackberry Cobbler","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Blackberry-Cobbler1.png?w=400","slug":"blackberry-cobbler"},{"date":"2024-01-07T00:00:00","name":"Andes Mint Avalanche","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Andes-Mint-Avalanche-updated.png?w=400","slug":"andes-mint-avalanche"},{"date":"2024-01-08T00:00:00","name":"Andes Mint Avalanche","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Andes-Mint-Avalanche-updated.png?w=400","slug":"andes-mint-avalanche"},{"date":"2024-01-09T00:00:00","name":"Andes Mint Avalanche","imageUrl":"https://cdn.culvers.com/menu-item-detail/img-Andes-Mint-Avalanche-updated.png?w=400","slug":"andes-mint-avalanche"}]}`

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

// TODO: TestGetExpiration

// TODO: Mock the redis client
func TestHandler(t *testing.T) {
	ctx := context.Background()

	res, err := handler(ctx, events.APIGatewayProxyRequest{
		PathParameters: map[string]string{
			"slug": "marion",
		},
		RequestContext: events.APIGatewayProxyRequestContext{
			RequestTime: time.Now().UTC().Format("02/Jan/2006:15:04:05 -0700"),
		},
	})
	if err != nil {
		t.Error(err)
	}

	fmt.Println(res.Body)
}
