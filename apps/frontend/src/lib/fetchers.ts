import { env } from "env";
import ky from "ky";

import type {
  AllFlavors,
  LocatedRestaurant,
  SluggedFlavor,
  SluggedRestaurant,
} from "@repo/types";
import type { LocateFormSchema } from "~/schemas/locate-form";

export async function locate({ location }: LocateFormSchema) {
  const restaurants = await ky
    .get(`${env.VITE_API_BASE_URL}/restaurants`, {
      searchParams: {
        ...(location.type === "address"
          ? { address: location.address }
          : {
              latitude: location.latitude,
              longitude: location.longitude,
            }),
      },
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
