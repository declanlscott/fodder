import { HTTPException } from "hono/http-exception";
import { env } from "env";

import { isFlavorFound, isFlavorsModule } from "~/schemas/external-api";

import type {
  AllFlavors,
  LocatedRestaurant,
  SluggedFlavor,
  SluggedRestaurant,
} from "@fodder/schemas";
import type {
  FetchedRestaurants,
  FlavorsModule,
  ScrapedAllFlavorsNextData,
  ScrapedFlavorNextData,
  ScrapedRestaurantNextData,
} from "~/schemas/external-api";

const imageWidth = 400;

export function formatFetchedRestaurants(
  json: FetchedRestaurants,
): Array<LocatedRestaurant> {
  return json.data.geofences.reduce(
    (restaurants, restaurant) => [
      ...restaurants,
      {
        name: `Culver's of ${restaurant.description}`,
        address: restaurant.metadata.street,
        city: restaurant.metadata.city,
        state: restaurant.metadata.state,
        zipCode: restaurant.metadata.postalCode,
        longitude: restaurant.geometryCenter.coordinates[0],
        latitude: restaurant.geometryCenter.coordinates[1],
        slug: restaurant.metadata.slug,
        fod: {
          name: restaurant.metadata.flavorOfDayName,
          imageUrl: formatFlavorImageUrl(
            restaurant.metadata.flavorOfDaySlug,
          ).toString(),
          slug: formatFlavorSlug(restaurant.metadata.flavorOfDayName),
        },
      },
    ],
    [] as Array<LocatedRestaurant>,
  );
}

export function formatFlavorSlug(name: string) {
  return name
    .replace(/[^a-zA-Z\s]+/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function formatFlavorImageUrl(imageSlug: string, includeWidth = false) {
  if (!imageSlug) return new URL(env.LOGO_SVG_URL);

  const url = new URL(`${env.FLAVOR_IMAGE_BASE_URL}/${imageSlug}`);

  if (includeWidth) url.searchParams.set("w", imageWidth.toString());

  return url;
}

export function formatScrapedRestaurant(
  nextData: ScrapedRestaurantNextData,
): SluggedRestaurant {
  const flavors =
    nextData.props.pageProps.page.customData.restaurantCalendar.flavors.reduce(
      (flavors, flavor) => {
        const imageSlug = flavor.image.src.split(`${imageWidth}/`)[1];
        const imageUrl = formatFlavorImageUrl(imageSlug, true).toString();

        return [
          ...flavors,
          {
            date: flavor.onDate,
            name: flavor.title,
            imageUrl,
            slug: flavor.urlSlug,
          },
        ];
      },
      [] as SluggedRestaurant["flavors"],
    );

  const restaurantProps =
    nextData.props.pageProps.page.customData.restaurantDetails;

  return {
    name: restaurantProps.title,
    address: restaurantProps.address,
    city: restaurantProps.city,
    state: restaurantProps.state,
    zipCode: restaurantProps.postalCode,
    phoneNumber: restaurantProps.phoneNumber,
    flavors,
  };
}

export function formatScrapedAllFlavors(
  nextData: ScrapedAllFlavorsNextData,
): AllFlavors {
  let data: FlavorsModule["customData"]["flavors"] | undefined;

  for (const module of nextData.props.pageProps.page.zones.Content)
    if (isFlavorsModule(module)) data = module.customData.flavors;

  if (!data)
    throw new HTTPException(404, {
      message: "Flavors not found",
    });

  return data.reduce(
    (flavors, flavor) => [
      ...flavors,
      {
        name: flavor.flavorName,
        imageUrl: formatFlavorImageUrl(flavor.fotdImage, true).toString(),
        slug: flavor.fotdUrlSlug,
      },
    ],
    [] as AllFlavors,
  );
}

export function formatScrapedFlavor(
  nextData: ScrapedFlavorNextData,
): SluggedFlavor {
  const flavorDetails = nextData.props.pageProps.page.customData.flavorDetails;

  if (!isFlavorFound(flavorDetails))
    throw new HTTPException(404, { message: "Flavor not found" });

  return {
    name: flavorDetails.name,
    imageUrl: formatFlavorImageUrl(flavorDetails.fotdImage).toString(),
    description: flavorDetails.description,
    allergens: flavorDetails.allergens.split(", "),
  };
}
