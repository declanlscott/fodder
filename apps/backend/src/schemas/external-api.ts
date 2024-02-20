import {
  array,
  boolean,
  nullable,
  number,
  object,
  string,
  tuple,
} from "valibot";

import type { Output } from "valibot";

export const RestaurantsApiResponseSchema = object({
  isSuccessful: boolean(),
  message: nullable(string()),
  data: object({
    meta: object({
      code: number(),
    }),
    geofences: array(
      object({
        _id: string(),
        live: boolean(),
        description: string(),
        metadata: object({
          dineInHours: string(),
          driveThruHours: string(),
          onlineOrderStatus: number(),
          flavorOfDayName: string(),
          flavorOfDaySlug: string(),
          openDate: string(),
          isTemporarilyClosed: boolean(),
          utcOffset: number(),
          street: string(),
          state: string(),
          city: string(),
          postalCode: string(),
          oloId: string(),
          slug: string(),
          jobsearchurl: string(),
          handoffOptions: string(),
        }),
        tag: string(),
        externalId: string(),
        type: string(),
        geometryCenter: object({
          type: string(),
          coordinates: tuple([number(), number()]),
        }),
        geometryRadius: number(),
        geometry: object({
          type: string(),
          coordinates: array(array(tuple([number(), number()]))),
        }),
        enabled: boolean(),
      }),
    ),
    totalResults: number(),
  }),
});

export type RestaurantsApiResponseSchema = Output<
  typeof RestaurantsApiResponseSchema
>;

export const FlavorPropsSchema = object({
  flavorId: number(),
  menuItemId: number(),
  onDate: string(),
  title: string(),
  urlSlug: string(),
  image: object({
    useWhiteBackground: boolean(),
    src: string(),
  }),
});

export type FlavorPropsSchema = Output<typeof FlavorPropsSchema>;

export const RestaurantScrapeNextDataSchema = object({
  props: object({
    pageProps: object({
      page: object({
        customData: object({
          restaurantDetails: object({
            id: number(),
            number: string(),
            title: string(),
            slug: string(),
            phoneNumber: string(),
            address: string(),
            city: string(),
            state: string(),
            postalCode: string(),
            latitude: number(),
            longitude: number(),
            onlineOrderUrl: string(),
            ownerFriendlyName: string(),
            ownerMessage: string(),
            jobsApplyUrl: string(),
            flavorOfTheDay: array(FlavorPropsSchema),
          }),
          restaurantCalendar: object({
            restaurant: object({
              id: number(),
              title: string(),
              slug: string(),
            }),
            flavors: array(FlavorPropsSchema),
          }),
        }),
      }),
    }),
  }),
});

export type RestaurantScrapeNextDataSchema = Output<
  typeof RestaurantScrapeNextDataSchema
>;
