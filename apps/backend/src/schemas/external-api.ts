import {
  array,
  boolean,
  coerce,
  date,
  literal,
  never,
  notValue,
  nullable,
  number,
  object,
  string,
  tuple,
  union,
  unknown,
  variant,
} from "valibot";

import type { Output } from "valibot";

export const FetchedRestaurants = object({
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
export type FetchedRestaurants = Output<typeof FetchedRestaurants>;

export const FlavorProps = object({
  flavorId: number(),
  menuItemId: number(),
  onDate: coerce(date(), (input) => new Date(input as string)),
  title: string(),
  urlSlug: string(),
  image: object({
    useWhiteBackground: boolean(),
    src: string(),
  }),
});
export type FlavorProps = Output<typeof FlavorProps>;

export const ScrapedRestaurantNextData = object({
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
            flavorOfTheDay: array(FlavorProps),
          }),
          restaurantCalendar: object({
            restaurant: object({
              id: number(),
              title: string(),
              slug: string(),
            }),
            flavors: array(FlavorProps),
          }),
        }),
      }),
    }),
  }),
});
export type ScrapedRestaurantNextData = Output<
  typeof ScrapedRestaurantNextData
>;

const flavorsModuleName = "FlavorOfTheDayAllFlavors";
export const FlavorsModule = object({
  moduleName: literal(flavorsModuleName),
  customData: object({
    flavors: array(
      object({
        idFlavor: number(),
        idMenuItem: number(),
        longFlavorName: string(),
        flavorName: string(),
        flavorCategories: array(object({ id: number(), name: string() })),
        flavorNameLocalized: nullable(string()),
        fotdImage: string(),
        fotdUrlSlug: string(),
        flavorNameSpanish: nullable(string()),
        fotdDescriptionSpanish: nullable(string()),
      }),
    ),
  }),
});
export type FlavorsModule = Output<typeof FlavorsModule>;
export const UnknownModule = object(
  {
    moduleName: string([notValue(flavorsModuleName)]),
  },
  unknown(),
);
export type UnknownModule = Output<typeof UnknownModule>;

export const ScrapedAllFlavorsNextData = object({
  props: object({
    pageProps: object({
      page: object({
        zones: object({
          Content: array(variant("moduleName", [FlavorsModule, UnknownModule])),
        }),
      }),
    }),
  }),
});
export type ScrapedAllFlavorsNextData = Output<
  typeof ScrapedAllFlavorsNextData
>;

export const isFlavorsModule = (
  module: ScrapedAllFlavorsNextData["props"]["pageProps"]["page"]["zones"]["Content"][number],
): module is FlavorsModule => module.moduleName === flavorsModuleName;

export const FlavorDetails = object({
  idFlavor: number(),
  idMenuItem: number(),
  slug: string(),
  name: string(),
  description: string(),
  fotdImage: string(),
  allergens: string(),
  ingredients: array(
    object({
      id: number(),
      title: string(),
      subIngredients: string(),
    }),
  ),
  flavorCategories: array(object({ id: number(), name: string() })),
});
export type FlavorDetails = Output<typeof FlavorDetails>;
export const FlavorDetailsNotFound = object({}, never());
export type FlavorDetailsNotFound = Output<typeof FlavorDetailsNotFound>;
export const FlavorDetailsUnion = union([FlavorDetails, FlavorDetailsNotFound]);
export type FlavorDetailsUnion = Output<typeof FlavorDetailsUnion>;
export const ScrapedFlavorNextData = object({
  props: object({
    pageProps: object({
      page: object({
        customData: object({
          flavorDetails: FlavorDetailsUnion,
        }),
      }),
    }),
  }),
});
export type ScrapedFlavorNextData = Output<typeof ScrapedFlavorNextData>;

export const isFlavorFound = (
  flavorDetails: FlavorDetailsUnion,
): flavorDetails is FlavorDetails => "idFlavor" in flavorDetails;
