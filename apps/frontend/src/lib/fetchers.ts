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
  const res = await ky(`${env.VITE_API_BASE_URL}/restaurants`, {
    searchParams: {
      ...(location.type === "address"
        ? { address: location.address }
        : {
            latitude: location.latitude,
            longitude: location.longitude,
          }),
    },
  });

  if (res.status === 204) {
    return [];
  }

  const restaurants = await res.json<LocatedRestaurant[]>();

  return restaurants;
}

export async function getRestaurant(slug: string) {
  const res = await ky(`${env.VITE_API_BASE_URL}/restaurants/${slug}`);

  const restaurant = await res.json<SluggedRestaurant>();

  return restaurant;
}

export async function getFlavors() {
  const res = await ky(`${env.VITE_API_BASE_URL}/flavors`);

  const flavors = await res.json<AllFlavors>();

  return flavors;
}

export async function getFlavor(slug: string) {
  const res = await ky(`${env.VITE_API_BASE_URL}/flavors/${slug}`);

  const flavor = await res.json<SluggedFlavor>();

  return flavor;
}
