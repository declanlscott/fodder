package main

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"io"
	"net/http"
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

func TestGetRestaurants(t *testing.T) {
	mockResponse := &http.Response{
		StatusCode: 200,
		Body: io.NopCloser(strings.NewReader(
			`{
			  "ErrorCode": null,
			  "ErrorMessage": null,
			  "Collection": {
				"Name": "poi",
				"Count": 1,
				"Country": "US",
				"Radius": 5,
				"CenterPoint": "-91.56961,42.065038",
				"State": "IA",
				"City": "MARION",
				"Address": "",
				"Province": "",
				"Postal": "52302",
				"Locations": [
				  {
					"Address": "1375 Red Fox Way",
					"Address2": "",
					"Latitude": "42.0384902954102",
					"Longitude": "-91.5510787963867",
					"Name": "Culver's of Marion, IA - Red Fox Way",
					"Distance": 2.07,
					"DistanceUnit": "mile",
					"Adi": "",
					"City": "Marion",
					"Id": 328,
					"Country": "US",
					"DateOpen": "",
					"Email": "",
					"FacebookPlaceUrl": "https://www.facebook.com/CulversMarion",
					"Fax": "",
					"Fbp": "Kelly Hughes",
					"FbpEmail": "",
					"FlavorDay": "Chocolate Caramel Twist",
					"FlavorId": null,
					"FlavorImageUrl": "https://cdn.culvers.com/menu-item-detail/img-Chocolate-Caramel-Twist2.png?w=120",
					"FridayOpen": "10:00 AM",
					"FridayClose": "10:00 PM",
					"Icon": "default",
					"JobApplyEmail": "",
					"JobSearchField": "https://j.wrkstrm.us/6d08eebf/culvers/marion-52014",
					"OtherAddress": "1375 Red Fox Way",
					"MondayOpen": "10:00 AM",
					"MondayClose": "10:00 PM",
					"StoreNumber": "320",
					"OpsMrkt": "HEARTLAND",
					"Owner": "",
					"Phone": "319-373-7575",
					"Postal": "52302",
					"Province": "",
					"SaturdayOpen": "10:00 AM",
					"SaturdayClose": "10:00 PM",
					"SignalCampaignId": "21107",
					"State": "IA",
					"SundayOpen": "10:00 AM",
					"SundayClose": "10:00 PM",
					"ThursdayOpen": "10:00 AM",
					"ThursdayClose": "10:00 PM",
					"TuesdayOpen": "10:00 AM",
					"TuesdayClose": "10:00 PM",
					"Type": "S",
					"Uid": "-2000922760",
					"UrlSlug": "http://www.culvers.com/restaurants/marion",
					"Url": "http://www.culvers.com/restaurants/marion",
					"WednesdayOpen": "10:00 AM",
					"WednesdayClose": "10:00 PM",
					"Cfsiml": "",
					"Cfsijml": "",
					"Cfsipml": "",
					"Cfsimml": "",
					"Cfsifml": ""
				  }
				]
			  }
			}`,
		)),
	}

	mockClient := &MockHttpClient{
		Response: mockResponse,
		Error:    nil,
	}

	actualJson, err := getRestaurants("https://example.com/api", mockClient)
	if err != nil {
		t.Errorf("Expected no error, but got %v", err)
	}

	expectedJson := `[{"name":"Culver's of Marion, IA - Red Fox Way","address":"1375 Red Fox Way","city":"Marion","state":"IA","country":"US","zipCode":"52302","latitude":42.0384902954102,"longitude":-91.5510787963867,"fod":"Chocolate Caramel Twist","fodImageUrl":"https://cdn.culvers.com/menu-item-detail/img-Chocolate-Caramel-Twist2.png","slug":"marion"}]`
	if !reflect.DeepEqual(actualJson, expectedJson) {
		t.Errorf("Expected JSON: %v\nActual JSON: %v", expectedJson, actualJson)
	}
}

func TestHandler(t *testing.T) {
	ctx := context.Background()

	res, err := handler(ctx, events.APIGatewayProxyRequest{
		QueryStringParameters: map[string]string{
			"zipCode": "52302",
			"radius":  "10",
		},
	})
	if err != nil {
		t.Error(err)
	}

	fmt.Println(res.Body)
}
