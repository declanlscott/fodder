import * as v from "valibot";

export const FetchedRestaurants = v.object({
  isSuccessful: v.boolean(),
  message: v.nullable(v.string()),
  data: v.object({
    meta: v.object({
      code: v.number(),
    }),
    geofences: v.array(
      v.object({
        _id: v.string(),
        live: v.boolean(),
        description: v.string(),
        metadata: v.object({
          dineInHours: v.string(),
          driveThruHours: v.string(),
          onlineOrderStatus: v.number(),
          flavorOfDayName: v.string(),
          flavorOfDaySlug: v.string(),
          openDate: v.string(),
          isTemporarilyClosed: v.boolean(),
          utcOffset: v.number(),
          street: v.string(),
          state: v.string(),
          city: v.string(),
          postalCode: v.string(),
          oloId: v.string(),
          slug: v.string(),
          jobsearchurl: v.string(),
          handoffOptions: v.string(),
        }),
        tag: v.string(),
        externalId: v.string(),
        type: v.string(),
        geometryCenter: v.object({
          type: v.string(),
          coordinates: v.tuple([v.number(), v.number()]),
        }),
        geometryRadius: v.number(),
        geometry: v.object({
          type: v.string(),
          coordinates: v.array(v.array(v.tuple([v.number(), v.number()]))),
        }),
      }),
    ),
    totalResults: v.number(),
  }),
});
export type FetchedRestaurants = v.InferOutput<typeof FetchedRestaurants>;

export const FlavorProps = v.object({
  flavorId: v.number(),
  menuItemId: v.number(),
  onDate: v.pipe(
    v.string(),
    v.transform((input) => new Date(input).toISOString()),
  ),
  title: v.string(),
  urlSlug: v.string(),
  image: v.object({
    useWhiteBackground: v.boolean(),
    src: v.string(),
  }),
});
export type FlavorProps = v.InferOutput<typeof FlavorProps>;

export const ScrapedRestaurantNextData = v.object({
  props: v.object({
    pageProps: v.object({
      page: v.object({
        customData: v.object({
          restaurantDetails: v.object({
            id: v.number(),
            number: v.string(),
            title: v.string(),
            slug: v.string(),
            phoneNumber: v.string(),
            address: v.string(),
            city: v.string(),
            state: v.string(),
            postalCode: v.string(),
            latitude: v.number(),
            longitude: v.number(),
            onlineOrderUrl: v.string(),
            ownerFriendlyName: v.string(),
            ownerMessage: v.nullable(v.string()),
            jobsApplyUrl: v.string(),
            flavorOfTheDay: v.array(FlavorProps),
          }),
          restaurantCalendar: v.object({
            restaurant: v.object({
              id: v.number(),
              title: v.string(),
              slug: v.string(),
            }),
            flavors: v.array(FlavorProps),
          }),
        }),
      }),
    }),
  }),
});
export type ScrapedRestaurantNextData = v.InferOutput<
  typeof ScrapedRestaurantNextData
>;

export const flavorsModuleName = "FlavorOfTheDayAllFlavors";
export const FlavorsModule = v.object({
  module: v.literal(flavorsModuleName),
  customData: v.object({
    flavors: v.array(
      v.object({
        idFlavor: v.number(),
        idMenuItem: v.number(),
        longFlavorName: v.string(),
        flavorName: v.string(),
        flavorCategories: v.array(
          v.object({ id: v.number(), name: v.string() }),
        ),
        flavorNameLocalized: v.nullable(v.string()),
        fotdImage: v.string(),
        fotdUrlSlug: v.string(),
        flavorNameSpanish: v.nullable(v.string()),
        fotdDescriptionSpanish: v.nullable(v.string()),
      }),
    ),
  }),
});
export type FlavorsModule = v.InferOutput<typeof FlavorsModule>;
export const UnknownModule = v.objectWithRest(
  { module: v.pipe(v.string(), v.notValue(flavorsModuleName)) },
  v.unknown(),
);
export type UnknownModule = v.InferOutput<typeof UnknownModule>;

export const ScrapedAllFlavorsNextData = v.object({
  props: v.object({
    pageProps: v.object({
      page: v.object({
        zones: v.object({
          Content: v.array(v.variant("module", [FlavorsModule, UnknownModule])),
        }),
      }),
    }),
  }),
});
export type ScrapedAllFlavorsNextData = v.InferOutput<
  typeof ScrapedAllFlavorsNextData
>;

export const isFlavorsModule = (
  module: ScrapedAllFlavorsNextData["props"]["pageProps"]["page"]["zones"]["Content"][number],
): module is FlavorsModule => module.module === flavorsModuleName;

export const FlavorDetails = v.object({
  idFlavor: v.number(),
  idMenuItem: v.number(),
  slug: v.string(),
  name: v.string(),
  description: v.string(),
  fotdImage: v.string(),
  allergens: v.string(),
  ingredients: v.array(
    v.object({
      id: v.number(),
      title: v.string(),
      subIngredients: v.string(),
    }),
  ),
  flavorCategories: v.array(v.object({ id: v.number(), name: v.string() })),
});
export type FlavorDetails = v.InferOutput<typeof FlavorDetails>;
export const FlavorDetailsNotFound = v.objectWithRest({}, v.never());
export type FlavorDetailsNotFound = v.InferOutput<typeof FlavorDetailsNotFound>;
export const FlavorDetailsUnion = v.union([
  FlavorDetails,
  FlavorDetailsNotFound,
]);
export type FlavorDetailsUnion = v.InferOutput<typeof FlavorDetailsUnion>;
export const ScrapedFlavorNextData = v.object({
  props: v.object({
    pageProps: v.object({
      page: v.object({
        customData: v.object({
          flavorDetails: FlavorDetailsUnion,
        }),
      }),
    }),
  }),
});
export type ScrapedFlavorNextData = v.InferOutput<typeof ScrapedFlavorNextData>;

export const isFlavorFound = (
  flavorDetails: FlavorDetailsUnion,
): flavorDetails is FlavorDetails => "idFlavor" in flavorDetails;
