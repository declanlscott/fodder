import { HTTPException } from "hono/http-exception";
import { env } from "env";
import { describe, expect, it } from "vitest";

import {
  formatFetchedRestaurants,
  formatFlavorImageUrl,
  formatFlavorSlug,
  formatScrapedAllFlavors,
  formatScrapedFlavor,
  formatScrapedRestaurant,
} from "~/lib/formatters";
import { flavorsModuleName } from "~/schemas/external-api";

import type {
  AllFlavors,
  LocatedRestaurant,
  SluggedFlavor,
  SluggedRestaurant,
} from "@fodder/schemas";
import type {
  FetchedRestaurants,
  FlavorDetails,
  FlavorDetailsNotFound,
  FlavorsModule,
  ScrapedAllFlavorsNextData,
  ScrapedFlavorNextData,
  ScrapedRestaurantNextData,
  UnknownModule,
} from "~/schemas/external-api";

describe("formatFetchedRestaurants", () => {
  it("correctly formats", () => {
    const input = {
      isSuccessful: true,
      message: null,
      data: {
        meta: { code: 0 },
        geofences: [
          {
            _id: "_id",
            live: true,
            description: "description",
            metadata: {
              dineInHours: "dineInHours",
              driveThruHours: "driveThruHours",
              onlineOrderStatus: 0,
              flavorOfDayName: "Flavor of Day Name",
              flavorOfDaySlug: "flavorOfDaySlug",
              openDate: "openDate",
              isTemporarilyClosed: false,
              utcOffset: 0,
              street: "street",
              state: "state",
              city: "city",
              postalCode: "postalCode",
              oloId: "oloId",
              slug: "slug",
              jobsearchurl: "jobsearchurl",
              handoffOptions: "handoffOptions",
            },
            tag: "tag",
            externalId: "externalId",
            type: "type",
            geometryCenter: { type: "type", coordinates: [0, 0] },
            geometryRadius: 0,
            geometry: { type: "type", coordinates: [[[0, 0]]] },
          },
        ],
        totalResults: 1,
      },
    } satisfies FetchedRestaurants;

    const output = formatFetchedRestaurants(input);
    const expected = [
      {
        name: `Culver's of ${input.data.geofences[0].description}`,
        address: input.data.geofences[0].metadata.street,
        city: input.data.geofences[0].metadata.city,
        state: input.data.geofences[0].metadata.state,
        zipCode: input.data.geofences[0].metadata.postalCode,
        longitude: input.data.geofences[0].geometryCenter.coordinates[0],
        latitude: input.data.geofences[0].geometryCenter.coordinates[1],
        slug: input.data.geofences[0].metadata.slug,
        fod: {
          name: input.data.geofences[0].metadata.flavorOfDayName,
          imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/${input.data.geofences[0].metadata.flavorOfDaySlug}`,
          slug: "flavor-of-day-name",
        },
      },
    ] satisfies Array<LocatedRestaurant>;
    expect(output).toEqual(expected);
  });
});

describe("formatFlavorSlug", () => {
  it("correctly formats", () => {
    const input = "Flavor Name";
    const output = formatFlavorSlug(input);
    const expected = "flavor-name";

    expect(output).toEqual(expected);
  });
});

describe("formatFlavorImageUrl", () => {
  it("correctly formats the image url when there is a slug", () => {
    const input = "slug";
    const output = formatFlavorImageUrl(input);

    expect(output).toEqual(new URL(`${env.FLAVOR_IMAGE_BASE_URL}/${input}`));
    expect(output.searchParams.get("w")).toBeNull();
  });

  it("correctly formats the image url when there is no slug", () => {
    const input = "";
    const output = formatFlavorImageUrl(input);

    expect(output).toEqual(new URL(env.LOGO_SVG_URL));
    expect(output.searchParams.get("w")).toBeNull();
  });

  it("correctly formats the image url when `includeWidth` is set to true", () => {
    const input = "slug";
    const output = formatFlavorImageUrl(input, true);

    expect(output.pathname).toContain(input);
    expect(output.searchParams.get("w")).toBeDefined();
  });
});

describe("formatScrapedRestaurant", () => {
  it("correctly formats", () => {
    const input = {
      props: {
        pageProps: {
          page: {
            customData: {
              restaurantDetails: {
                // country: "country",
                name: "name",
                // olorestaurantid: 0,
                // restaurantId: "0",
                // restaurantNumber: "0",
                // onlineOrderUrl: "onlineOrderUrl",
                // ownerMessage: "ownerMessage",
                // ownerFriendlyName: "ownerFriendlyName",
                // jobsApplyUrl: "jobsApplyUrl",
                telephone: "telephone",
                streetAddress: "streetAddress",
                city: "city",
                state: "state",
                zip: "zip",
                // latitude: 0,
                // longitude: 0,
                // labels: [
                //   {
                //     key: "key",
                //     value: "value",
                //   },
                // ],
                // customerFacingMessage: "customerFacingMessage",
                // urlSlug: "urlSlug",
                // timeZoneOffset: 0,
                // isTemporaryClosed: false,
                // openDate: "1/1/1970",
                // openTime: "1970-01-01T00:00:00Z",
                // closeTime: "1970-01-01T00:00:00Z",
                // isOpenNow: false,
                // upcomingEvents: [],
                // handoffOptions: ["handoffOptions"],
                // flavors: [
                //   {
                //     flavorId: 0,
                //     description: "description",
                //     menuItemId: 0,
                //     calendarDate: "1970-01-01T00:00:00",
                //     name: "name",
                //     urlSlug: "urlSlug",
                //     image: {
                //       useWhiteBackground: false,
                //       imagePath: "imagePath",
                //     },
                //   },
                // ],
                // currentTimes: {
                //   dineInTimes: [
                //     {
                //       opens: "opens",
                //       closes: "closes",
                //       dayOfWeek: "dayOfWeek",
                //       day: "day",
                //     },
                //   ],
                //   driveThruTimes: [
                //     {
                //       opens: "opens",
                //       closes: "closes",
                //       dayOfWeek: "dayOfWeek",
                //       day: "day",
                //     },
                //   ],
                //   curdSideTimes: [
                //     {
                //       opens: "opens",
                //       closes: "closes",
                //       dayOfWeek: "dayOfWeek",
                //       day: "day",
                //     },
                //   ],
                //   deliveryTimes: [
                //     {
                //       opens: "opens",
                //       closes: "closes",
                //       dayOfWeek: "dayOfWeek",
                //       day: "day",
                //     },
                //   ],
                //   lateNightDriveThruTimes: null,
                // },
                // hoursTimeBlocks: {
                //   dineInTimes: [{ days: "days", times: "times" }],
                //   driveThruTimes: [{ days: "days", times: "times" }],
                //   curdSideTimes: [{ days: "days", times: "times" }],
                //   lateNightDriveThruTimes: null,
                //   deliveryTimes: [{ days: "days", times: "times" }],
                // },
                // temporalClosures: [],
                // onlineOrderStatus: "0",
                // isDiningRoomClosed: false,
                // isLobbyClosed: false,
                // isDriveThruClosed: false,
                // isCurdsideUnavailable: false,
                // groupedHours: {
                //   hoursByDestination: [
                //     {
                //       destination: "destination",
                //       hoursTimeBlocks: [{ days: "days", times: "times" }],
                //     },
                //   ],
                // },
              },
              restaurantCalendar: {
                restaurant: {
                  id: 0,
                  title: "title",
                  slug: "slug",
                },
                flavors: [
                  {
                    flavorId: 0,
                    menuItemId: 0,
                    onDate: "2024-03-04T00:00:00",
                    title: "title",
                    urlSlug: "urlSlug",
                    image: {
                      useWhiteBackground: true,
                      src: "https://cdn.culvers.com/menu-item-detail/slug.png",
                    },
                  },
                ],
              },
            },
          },
        },
      },
    } satisfies ScrapedRestaurantNextData;

    const output = formatScrapedRestaurant(input);

    const expected = {
      name: input.props.pageProps.page.customData.restaurantDetails.name,
      address:
        input.props.pageProps.page.customData.restaurantDetails.streetAddress,
      city: input.props.pageProps.page.customData.restaurantDetails.city,
      state: input.props.pageProps.page.customData.restaurantDetails.state,
      zipCode: input.props.pageProps.page.customData.restaurantDetails.zip,
      phoneNumber:
        input.props.pageProps.page.customData.restaurantDetails.telephone,
      flavors: [
        {
          date: input.props.pageProps.page.customData.restaurantCalendar
            .flavors[0].onDate,
          name: input.props.pageProps.page.customData.restaurantCalendar
            .flavors[0].title,
          imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/slug.png?w=400`,
          slug: input.props.pageProps.page.customData.restaurantCalendar
            .flavors[0].urlSlug,
        },
      ],
    } satisfies SluggedRestaurant;

    expect(output).toEqual(expected);
  });
});

describe("formatScrapedAllFlavors", () => {
  it("correctly formats with flavors module", () => {
    const flavorsModule = {
      module: flavorsModuleName,
      customData: {
        flavors: [
          {
            idFlavor: 0,
            idMenuItem: 0,
            longFlavorName: "longFlavorName",
            flavorName: "flavorName",
            flavorCategories: [
              {
                id: 0,
                name: "name 0",
              },
              {
                id: 1,
                name: "name 1",
              },
            ],
            flavorNameLocalized: null,
            fotdImage: "fotdImage",
            fotdUrlSlug: "fotdUrlSlug",
            flavorNameSpanish: null,
            fotdDescriptionSpanish: null,
          },
        ],
      },
    } satisfies FlavorsModule;

    const input = {
      props: { pageProps: { page: { zones: { Content: [flavorsModule] } } } },
    } satisfies ScrapedAllFlavorsNextData;

    const output = formatScrapedAllFlavors(input);

    const expected = [
      {
        name: input.props.pageProps.page.zones.Content[0].customData.flavors[0]
          .flavorName,
        imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/${input.props.pageProps.page.zones.Content[0].customData.flavors[0].fotdImage}?w=400`,
        slug: input.props.pageProps.page.zones.Content[0].customData.flavors[0]
          .fotdUrlSlug,
      },
    ] satisfies AllFlavors;

    expect(output).toEqual(expected);
  });

  it("throws HTTPException without flavors module", () => {
    const unknownModule = {
      module: "UnknownModule",
    } satisfies UnknownModule;

    const input = {
      props: {
        pageProps: {
          page: {
            zones: {
              Content: [unknownModule],
            },
          },
        },
      },
    } satisfies ScrapedAllFlavorsNextData;

    expect(() => formatScrapedAllFlavors(input)).toThrowError(HTTPException);
  });
});

describe("formatScrapedFlavor", () => {
  it("correctly formats with flavor details", () => {
    const flavorDetails = {
      idFlavor: 0,
      idMenuItem: 0,
      slug: "slug",
      name: "name",
      description: "description",
      fotdImage: "fotdImage",
      allergens: "allergen 0, allergen 1",
      ingredients: [
        {
          id: 0,
          title: "title 0",
          subIngredients: "subIngredients ",
        },
      ],
      flavorCategories: [{ id: 0, name: "name 0" }],
    } satisfies FlavorDetails;

    const input = {
      props: { pageProps: { page: { customData: { flavorDetails } } } },
    } satisfies ScrapedFlavorNextData;

    const output = formatScrapedFlavor(input);

    const expected = {
      name: input.props.pageProps.page.customData.flavorDetails.name,
      imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/${input.props.pageProps.page.customData.flavorDetails.fotdImage}`,
      description:
        input.props.pageProps.page.customData.flavorDetails.description,
      allergens:
        input.props.pageProps.page.customData.flavorDetails.allergens.split(
          ", ",
        ),
    } satisfies SluggedFlavor;

    expect(output).toEqual(expected);
  });

  it("throws HTTPException without flavor details", () => {
    const flavorDetails = {} satisfies FlavorDetailsNotFound;

    const input = {
      props: { pageProps: { page: { customData: { flavorDetails } } } },
    } satisfies ScrapedFlavorNextData;

    expect(() => formatScrapedFlavor(input)).toThrowError(HTTPException);
  });
});
