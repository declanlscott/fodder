import {
  AllFlavors,
  LocatedRestaurant,
  SluggedFlavor,
  SluggedRestaurant,
} from "@fodder/schemas";
import { env } from "env";
import * as v from "valibot";

import type { LocateRestaurantsSchema } from "~/schemas/locate-restaurants";

export async function locate(data: LocateRestaurantsSchema) {
  const url = new URL(`${env.VITE_API_BASE_URL}/restaurants`);
  const params = new URLSearchParams(
    data.type === "address"
      ? { address: data.address }
      : {
          latitude: data.latitude.toString(),
          longitude: data.longitude.toString(),
        },
  );
  url.search = params.toString();

  const res = await fetch(url, { method: "GET" });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(res.statusText);

  return v.parse(v.array(LocatedRestaurant), await res.json());
}

export async function getRestaurant(slug: string) {
  const url = new URL(`${env.VITE_API_BASE_URL}/restaurants/${slug}`);

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(res.statusText);

  return v.parse(SluggedRestaurant, await res.json());
}

export async function getAllFlavors() {
  const url = new URL(`${env.VITE_API_BASE_URL}/flavors`);

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(res.statusText);

  return v.parse(AllFlavors, await res.json());
}

export async function getFlavor(slug: string) {
  const url = new URL(`${env.VITE_API_BASE_URL}/flavors/${slug}`);

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(res.statusText);

  return v.parse(SluggedFlavor, await res.json());
}
