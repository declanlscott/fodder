import { HTTPException } from "hono/http-exception";
import { env } from "env";

import { isFlavorFound, isFlavorsModule } from "~/schemas/external-api";

import type {
  AllFlavors,
  LocatedRestaurant,
  SluggedFlavor,
  SluggedRestaurant,
} from "@repo/types";
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
): LocatedRestaurant[] {
  return json.data.geofences.reduce((acc, curr) => {
    const fod: LocatedRestaurant["fod"] = {
      name: curr.metadata.flavorOfDayName,
      imageUrl: formatFlavorImageUrl(curr.metadata.flavorOfDaySlug).toString(),
      slug: formatFlavorSlug(curr.metadata.flavorOfDayName),
    };

    const restaurant: LocatedRestaurant = {
      name: `Culver's of ${curr.description}`,
      address: curr.metadata.street,
      city: curr.metadata.city,
      state: curr.metadata.state,
      zipCode: curr.metadata.postalCode,
      longitude: curr.geometryCenter.coordinates[0],
      latitude: curr.geometryCenter.coordinates[1],
      slug: curr.metadata.slug,
      fod,
    };

    return [...acc, restaurant];
  }, [] as LocatedRestaurant[]);
}

export function formatFlavorSlug(name: string) {
  return name
    .replace(/[^a-zA-Z\s]+/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function formatFlavorImageUrl(imageSlug: string, includeWidth = false) {
  if (!imageSlug) {
    return new URL(env.LOGO_SVG_URL);
  }

  const url = new URL(`${env.FLAVOR_IMAGE_BASE_URL}/${imageSlug}`);

  if (includeWidth) {
    url.searchParams.set("w", `${imageWidth}`);
  }

  return url;
}

export function formatScrapedRestaurant(
  nextData: ScrapedRestaurantNextData,
): SluggedRestaurant {
  const flavors =
    nextData.props.pageProps.page.customData.restaurantCalendar.flavors.reduce(
      (acc, curr) => {
        const imageSlug = curr.image.src.split(`${imageWidth}/`)[1];
        const imageUrl = formatFlavorImageUrl(imageSlug, true).toString();

        const flavor: SluggedRestaurant["flavors"][number] = {
          date: curr.onDate,
          name: curr.title,
          imageUrl,
          slug: curr.urlSlug,
        };

        return [...acc, flavor];
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

  for (const module of nextData.props.pageProps.page.zones.Content) {
    if (isFlavorsModule(module)) {
      data = module.customData.flavors;
    }
  }

  if (!data) {
    throw new HTTPException(404, {
      message: "Flavors not found",
    });
  }

  return data.reduce((acc, curr) => {
    const flavor = {
      name: curr.flavorName,
      imageUrl: formatFlavorImageUrl(curr.fotdImage, true).toString(),
      slug: curr.fotdUrlSlug,
    };

    return [...acc, flavor];
  }, [] as AllFlavors);
}

export function formatScrapedFlavor(
  nextData: ScrapedFlavorNextData,
): SluggedFlavor {
  const flavorDetails = nextData.props.pageProps.page.customData.flavorDetails;

  if (!isFlavorFound(flavorDetails)) {
    throw new HTTPException(404, { message: "Flavor not found" });
  }

  const flavor = {
    name: flavorDetails.name,
    imageUrl: formatFlavorImageUrl(flavorDetails.fotdImage).toString(),
    description: flavorDetails.description,
    allergens: flavorDetails.allergens.split(", "),
  };

  return flavor;
}
