import { env } from "hono/adapter";

import { HTTPExceptionWithJsonBody } from "~/lib/exceptions";
import { isFlavorsModule } from "~/schemas/external-api";

import type { Context } from "hono";
import type {
  FetchedRestaurants,
  FlavorProps,
  FlavorsModule,
  ScrapedAllFlavorsNextData,
  ScrapedFlavorNextData,
  ScrapedRestaurantNextData,
} from "~/schemas/external-api";
import type {
  AllFlavors,
  LocatedRestaurant,
  SluggedFlavor,
  SluggedRestaurant,
} from "~/types/api";
import type { Bindings } from "~/types/env";

const imageWidth = 400;

export function formatFetchedRestaurants({
  c,
  json,
}: {
  c: Context<{ Bindings: Bindings }>;
  json: FetchedRestaurants;
}): LocatedRestaurant[] {
  return json.data.geofences.reduce((acc, curr) => {
    const name = curr.metadata.flavorOfDayName;

    const slug = name
      .replace(/[^a-zA-Z\s]+/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    const fod: LocatedRestaurant["fod"] = {
      name,
      imageUrl: formatFodImageUrl({
        c,
        fodImageSlug: curr.metadata.flavorOfDaySlug,
      }),
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

function formatFodImageUrl({
  c,
  fodImageSlug,
}: {
  c: Context<{ Bindings: Bindings }>;
  fodImageSlug: string;
}) {
  if (!fodImageSlug) {
    return env(c).LOGO_SVG_URL;
  }

  return `${env(c).FLAVOR_IMAGE_BASE_URL}/${fodImageSlug}`;
}

export function formatScrapedRestaurant({
  c,
  nextData,
}: {
  c: Context<{ Bindings: Bindings }>;
  nextData: ScrapedRestaurantNextData;
}): SluggedRestaurant {
  const filteredFlavors = filterFlavorsByDate({
    flavors:
      nextData.props.pageProps.page.customData.restaurantCalendar.flavors,
  });

  const flavors = filteredFlavors.reduce(
    (acc, curr) => {
      const imageSlug = curr.image.src.split(`${imageWidth}/`)[1];
      const imageUrl = imageSlug
        ? `${env(c).FLAVOR_IMAGE_BASE_URL}/${imageSlug}?w=${imageWidth}`
        : env(c).LOGO_SVG_URL;

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

function filterFlavorsByDate({ flavors }: { flavors: FlavorProps[] }) {
  const now = new Date();

  const chicagoNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Chicago" }),
  );

  const today = new Date(
    chicagoNow.getFullYear(),
    chicagoNow.getMonth(),
    chicagoNow.getDate(),
  );

  return flavors.filter((flavor) => {
    const fodDate = new Date(flavor.onDate);
    if (isNaN(fodDate.getTime())) {
      throw new HTTPExceptionWithJsonBody(500, {
        message: `Failed to parse flavor date: "${flavor.onDate}"`,
      });
    }

    if (fodDate.getTime() >= today.getTime()) {
      return true;
    }

    return false;
  });
}

export function formatScrapedAllFlavors({
  c,
  nextData,
}: {
  c: Context<{ Bindings: Bindings }>;
  nextData: ScrapedAllFlavorsNextData;
}): AllFlavors {
  let data: FlavorsModule["customData"]["flavors"] | undefined;

  for (const module of nextData.props.pageProps.page.zones.Content) {
    if (isFlavorsModule(module)) {
      data = module.customData.flavors;
    }
  }

  if (!data) {
    throw new HTTPExceptionWithJsonBody(500, {
      message: "Failed to find flavors module",
    });
  }

  return data.reduce((acc, curr) => {
    const flavor = {
      name: curr.flavorName,
      imageUrl: `${env(c).FLAVOR_IMAGE_BASE_URL}/${curr.fotdImage}?w=${imageWidth}`,
      slug: curr.fotdUrlSlug,
    };

    return [...acc, flavor];
  }, [] as AllFlavors);
}

export function formatScrapedFlavor({
  c,
  nextData,
}: {
  c: Context<{ Bindings: Bindings }>;
  nextData: ScrapedFlavorNextData;
}): SluggedFlavor {
  const flavorProps = nextData.props.pageProps.page.customData.flavorDetails;

  const flavor = {
    name: flavorProps.name,
    imageUrl: `${env(c).FLAVOR_IMAGE_BASE_URL}/${flavorProps.fotdImage}`,
    description: flavorProps.description,
    allergens: flavorProps.allergens.split(", "),
  };

  return flavor;
}
