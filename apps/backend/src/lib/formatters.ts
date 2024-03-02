import { HTTPException } from "hono/http-exception";
import { env } from "env";

import { isLambdaBindings } from "~/lib/bindings";
import { isFlavorFound, isFlavorsModule } from "~/schemas/external-api";

import type {
  AllFlavors,
  LocatedRestaurant,
  SluggedFlavor,
  SluggedRestaurant,
} from "@repo/types";
import type { Context } from "hono";
import type { ApiGatewayRequestContextV2 } from "hono/aws-lambda";
import type { Bindings } from "~/lib/bindings";
import type {
  FetchedRestaurants,
  FlavorProps,
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
    const name = curr.metadata.flavorOfDayName;

    const slug = name
      .replace(/[^a-zA-Z\s]+/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    const fod: LocatedRestaurant["fod"] = {
      name,
      imageUrl: formatFodImageUrl(curr.metadata.flavorOfDaySlug),
      slug,
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

function formatFodImageUrl(fodImageSlug: string) {
  if (!fodImageSlug) {
    return env.LOGO_SVG_URL;
  }

  return `${env.FLAVOR_IMAGE_BASE_URL}/${fodImageSlug}`;
}

export function formatScrapedRestaurant(
  c: Context<{ Bindings: Bindings }>,
  nextData: ScrapedRestaurantNextData,
): SluggedRestaurant {
  const now = isLambdaBindings(c.env)
    ? new Date(
        (c.env.event.requestContext as ApiGatewayRequestContextV2).timeEpoch,
      )
    : new Date();

  const filteredFlavors = filterFlavorsByDate(
    now,
    nextData.props.pageProps.page.customData.restaurantCalendar.flavors,
  );

  const flavors = filteredFlavors.reduce(
    (acc, curr) => {
      const imageSlug = curr.image.src.split(`${imageWidth}/`)[1];
      const imageUrl = imageSlug
        ? `${env.FLAVOR_IMAGE_BASE_URL}/${imageSlug}?w=${imageWidth}`
        : env.LOGO_SVG_URL;

      const flavor: SluggedRestaurant["flavors"][number] = {
        date: curr.onDate.toISOString(),
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

function filterFlavorsByDate(now: Date, flavors: FlavorProps[]) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return flavors.filter(({ onDate }) => onDate.getTime() >= today.getTime());
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
      imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/${curr.fotdImage}?w=${imageWidth}`,
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
    imageUrl: `${env.FLAVOR_IMAGE_BASE_URL}/${flavorDetails.fotdImage}`,
    description: flavorDetails.description,
    allergens: flavorDetails.allergens.split(", "),
  };

  return flavor;
}
