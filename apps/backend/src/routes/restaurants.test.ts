import { describe, expect, test } from "vitest";

import restaurants from "~/routes/restaurants";

import type { LocatedRestaurant, SluggedRestaurant } from "@repo/types";
import type { Bindings } from "~/types/env";

const env = getMiniflareBindings() satisfies Bindings;

describe("/restaurants", () => {
  const mockAgent = getMiniflareFetchMock();
  mockAgent.disableNetConnect();

  const mockPool = mockAgent.get(new URL(env.EXTERNAL_API_BASE_URL).origin);

  const restaurantsInterceptor = mockPool.intercept({
    method: "GET",
    path: "/api/restaurants/getLocations?limit=1000&location=12345",
  });

  restaurantsInterceptor.reply(
    200,
    `{"isSuccessful":true,"message":null,"data":{"meta":{"code":200},"geofences":[{"_id":"_id","live":true,"description":"City, State - Main Street","metadata":{"dineInHours":"dineInHours","driveThruHours":"driveThruHours","onlineOrderStatus":1,"flavorOfDayName":"Chocolate Custard","flavorOfDaySlug":"img-Chocolate.png","openDate":"openDate","isTemporarilyClosed":false,"utcOffset":0,"street":"123 Main Street","state":"State","city":"City","postalCode":"12345","oloId":"oloId","slug":"city","jobsearchurl":"jobsearchurl","handoffOptions":"handoffOptions"},"tag":"tag","externalId":"externalId","type":"type","geometryCenter":{"type":"type","coordinates":[0,0]},"geometryRadius":0,"geometry":{"type":"type","coordinates":[[[0,0]]]},"enabled":true}],"totalResults":1}}`,
  );

  test("GET /", async () => {
    const res = await restaurants.request(
      "/?address=12345",
      { method: "GET" },
      env,
    );

    const received = await res.json();

    const expected = [
      {
        name: "Culver's of City, State - Main Street",
        address: "123 Main Street",
        city: "City",
        state: "State",
        zipCode: "12345",
        longitude: 0,
        latitude: 0,
        slug: "city",
        fod: {
          name: "Chocolate Custard",
          imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/img-Chocolate.png`,
          slug: "chocolate-custard",
        },
      },
    ] satisfies LocatedRestaurant[];

    expect(res.status).toEqual(200);
    expect(received).toEqual(expected);
  });

  test("GET / (no query params)", async () => {
    const res = await restaurants.request("/", { method: "GET" }, env);

    expect(res.status).toEqual(400);
  });

  test("GET / (missing latitude)", async () => {
    const res = await restaurants.request(
      "/?longitude=0",
      { method: "GET" },
      env,
    );

    expect(res.status).toEqual(400);
  });

  test("GET / (missing longitude)", async () => {
    const res = await restaurants.request(
      "/?latitude=0",
      { method: "GET" },
      env,
    );

    expect(res.status).toEqual(400);
  });

  test("GET / (invalid latitude)", async () => {
    const res = await restaurants.request(
      "/?latitude=91&longitude=0",
      { method: "GET" },
      env,
    );

    expect(res.status).toEqual(400);
  });

  test("GET / (invalid longitude)", async () => {
    const res = await restaurants.request(
      "/?latitude=0&longitude=181",
      { method: "GET" },
      env,
    );

    expect(res.status).toEqual(400);
  });

  const slug = "city";
  const restaurantInterceptor = mockPool.intercept({
    method: "GET",
    path: `restaurants/${slug}`,
  });

  const today = new Date();
  const yesterday = new Date();
  const tomorrow = new Date();
  yesterday.setDate(today.getDate() - 1);
  tomorrow.setDate(today.getDate() + 1);

  restaurantInterceptor.reply(
    200,
    `<html><body><div id="__next"></div><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"page":{"customData":{"restaurantDetails":{"id":1,"number":"1","title":"Culver's of City, State - 123 Main Street","slug":"city","phoneNumber":"123-456-7890","address":"123 Main Street","city":"City","state":"State","postalCode":"12345","latitude":0,"longitude":0,"onlineOrderUrl":"orderOnlineUrl","ownerFriendlyName":"ownerFriendlyName","ownerMessage":"ownerMessage","jobsApplyUrl":"jobsApplyUrl","flavorOfTheDay":[{"flavorId":2,"menuItemId":2,"onDate":"${today.toISOString()}","title":"Chocolate Custard","urlSlug":"chocolate-custard","image":{"useWhiteBackground":true,"src":"https://cloudfront.net/menu-item-detail/400/img-Chocolate-Custard.png"}},{"flavorId":3,"menuItemId":3,"onDate":"${tomorrow.toISOString()}","title":"Strawberry Custard","urlSlug":"strawberry-custard","image":{"useWhiteBackground":true,"src":"https://cloudfront.net/menu-item-detail/400/img-Strawberry-Custard.png"}}]},"restaurantCalendar":{"restaurant":{"id":1,"title":"Culver's of City, State - Main Street","slug":"city"},"flavors":[{"flavorId":1,"menuItemId":1,"onDate":"${yesterday.toISOString()}","title":"Vanilla Custard","urlSlug":"vanilla-custard","image":{"useWhiteBackground":true,"src":"https://cloudfront.net/menu-item-detail/400/img-Vanilla-Custard.png"}},{"flavorId":2,"menuItemId":2,"onDate":"${today.toISOString()}","title":"Chocolate Custard","urlSlug":"chocolate-custard","image":{"useWhiteBackground":true,"src":"https://cloudfront.net/menu-item-detail/400/img-Chocolate-Custard.png"}},{"flavorId":3,"menuItemId":3,"onDate":"${tomorrow.toISOString()}","title":"Strawberry Custard","urlSlug":"strawberry-custard","image":{"useWhiteBackground":true,"src":"https://cloudfront.net/menu-item-detail/400/img-Strawberry-Custard.png"}}]}}}}}}</script></body></html>`,
  );

  test("GET /:slug", async () => {
    const res = await restaurants.request(`/${slug}`, { method: "GET" }, env);

    const actual = await res.json();

    const expected = {
      name: "Culver's of City, State - 123 Main Street",
      address: "123 Main Street",
      city: "City",
      state: "State",
      zipCode: "12345",
      phoneNumber: "123-456-7890",
      flavors: [
        {
          date: today.toISOString(),
          name: "Chocolate Custard",
          imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/img-Chocolate-Custard.png?w=400`,
          slug: "chocolate-custard",
        },
        {
          date: tomorrow.toISOString(),
          name: "Strawberry Custard",
          imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/img-Strawberry-Custard.png?w=400`,
          slug: "strawberry-custard",
        },
      ],
    } satisfies SluggedRestaurant;

    expect(res.status).toEqual(200);
    expect(actual).toEqual(expected);
  });

  const badSlug = "not-a-restaurant";
  const badSlugRestaurantInterceptor = mockPool.intercept({
    method: "GET",
    path: `restaurants/${badSlug}`,
  });

  badSlugRestaurantInterceptor.reply(404, `<html></html>`);

  test("GET /:slug (bad slug)", async () => {
    const res = await restaurants.request(
      `/${badSlug}`,
      { method: "GET" },
      env,
    );

    const received = await res.text();

    const expected = "Restaurant not found";

    expect(res.status).toEqual(404);
    expect(received).toEqual(expected);
  });
});
