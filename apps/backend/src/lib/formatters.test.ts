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
} from "@repo/types";
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
            enabled: true,
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
    ] satisfies LocatedRestaurant[];
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
                id: 0,
                number: "number",
                title: "title",
                slug: "slug",
                phoneNumber: "phoneNumber",
                address: "address",
                city: "city",
                state: "state",
                postalCode: "postalCode",
                latitude: 0,
                longitude: 0,
                onlineOrderUrl: "onlineOrderUrl",
                ownerFriendlyName: "ownerFriendlyName",
                ownerMessage: "ownerMessage",
                jobsApplyUrl: "jobsApplyUrl",
                flavorOfTheDay: [],
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
                      src: "https://example.com/400/slug.png",
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
      name: input.props.pageProps.page.customData.restaurantDetails.title,
      address: input.props.pageProps.page.customData.restaurantDetails.address,
      city: input.props.pageProps.page.customData.restaurantDetails.city,
      state: input.props.pageProps.page.customData.restaurantDetails.state,
      zipCode:
        input.props.pageProps.page.customData.restaurantDetails.postalCode,
      phoneNumber:
        input.props.pageProps.page.customData.restaurantDetails.phoneNumber,
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
      moduleName: flavorsModuleName,
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
      moduleName: "UnknownModule",
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
