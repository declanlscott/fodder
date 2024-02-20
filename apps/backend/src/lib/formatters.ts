import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";

import type { Context } from "hono";
import type { LocatedRestaurant, SluggedRestaurant } from "types/api";
import type { EnvSchema } from "~/schemas/env";
import type {
  FlavorPropsSchema,
  RestaurantsApiResponseSchema,
  RestaurantScrapeNextDataSchema,
} from "~/schemas/external-api";

export function formatLocatedRestaurants({
  c,
  data: { data },
}: {
  c: Context;
  data: RestaurantsApiResponseSchema;
}): LocatedRestaurant[] {
  return data.geofences.reduce((acc, curr) => {
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
  c: Context;
  fodImageSlug: string;
}) {
  if (!fodImageSlug) {
    return env<EnvSchema>(c).LOGO_SVG_URL;
  }

  return `${env<EnvSchema>(c).BASE_IMAGE_URL}/${fodImageSlug}`;
}

export function formatSluggedRestaurant({
  c,
  data,
}: {
  c: Context;
  data: RestaurantScrapeNextDataSchema;
}): SluggedRestaurant {
  const filteredFlavors = filterFlavorsByDate({
    flavors: data.props.pageProps.page.customData.restaurantCalendar.flavors,
  });

  const flavors = filteredFlavors.reduce(
    (acc, curr) => {
      const width = 400;
      const imageSlug = curr.image.src.split(`${width}/`)[1];
      const imageUrl = imageSlug
        ? `${env<EnvSchema>(c).BASE_IMAGE_URL}/${imageSlug}?w=${width}`
        : env<EnvSchema>(c).LOGO_SVG_URL;

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
    data.props.pageProps.page.customData.restaurantDetails;

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

function filterFlavorsByDate({ flavors }: { flavors: FlavorPropsSchema[] }) {
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
      throw new HTTPException(500, {
        message: `Failed to parse flavor date: "${flavor.onDate}"`,
      });
    }

    if (fodDate.getTime() >= today.getTime()) {
      return true;
    }

    return false;
  });
}
