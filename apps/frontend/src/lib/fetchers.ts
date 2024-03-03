import { env } from "env";
import ky from "ky";

import type {
  AllFlavors,
  LocatedRestaurant,
  SluggedFlavor,
  SluggedRestaurant,
} from "@repo/types";
import type { LocateRestaurantsSchema } from "~/schemas/locate-restaurants";

export async function locate(data: LocateRestaurantsSchema) {
  const restaurants = await ky
    .get(`${env.VITE_API_BASE_URL}/restaurants`, {
      searchParams:
        data.type === "address"
          ? { address: data.address }
          : { latitude: data.latitude, longitude: data.longitude },
    })
    .json<LocatedRestaurant[]>();

  return restaurants;
}

export async function getRestaurant(slug: string) {
  const restaurant = await ky
    .get(`${env.VITE_API_BASE_URL}/restaurants/${slug}`)
    .json<SluggedRestaurant>();

  return restaurant;
}

export async function getAllFlavors() {
  const allFlavors = await ky
    .get(`${env.VITE_API_BASE_URL}/flavors`)
    .json<AllFlavors>();

  return allFlavors;
}

export async function getFlavor(slug: string) {
  const flavor = await ky
    .get(`${env.VITE_API_BASE_URL}/flavors/${slug}`)
    .json<SluggedFlavor>();

  return flavor;
}
