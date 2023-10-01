import { env } from "env";
import ky from "ky";

import { LocateSchema } from "~/lib/schemas";
import {
  FlavorData,
  FlavorsData,
  RestaurantData,
  RestaurantsData,
} from "~/lib/types";

export async function locate({ location, radius }: LocateSchema) {
  const res = await ky(`${env.VITE_API_BASE_URL}/restaurants`, {
    searchParams: {
      ...(location.type === "address"
        ? { address: location.address }
        : {
            latitude: location.latitude,
            longitude: location.longitude,
          }),
      radius: radius,
    },
  });

  if (res.status === 204) {
    return [];
  }

  const restaurants = await res.json<RestaurantsData>();

  return restaurants;
}

export async function getRestaurant(slug: string) {
  const res = await ky(`${env.VITE_API_BASE_URL}/restaurants/${slug}`);

  const restaurant = await res.json<RestaurantData>();

  return restaurant;
}

export async function getFlavors() {
  const res = await ky(`${env.VITE_API_BASE_URL}/flavors`);

  const flavors = await res.json<FlavorsData>();

  return flavors;
}

export async function getFlavor(slug: string) {
  const res = await ky(`${env.VITE_API_BASE_URL}/flavors/${slug}`);

  const flavor = await res.json<FlavorData>();

  return flavor;
}
