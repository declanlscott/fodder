import { queryOptions } from "@tanstack/react-query";

import {
  getAllFlavors,
  getFlavor,
  getRestaurant,
  locate,
} from "~/lib/fetchers";

import type { LocateRestaurantsSchema } from "~/schemas/locate-restaurants";

export const queryOptionsFactory = {
  restaurant: (slug: string) =>
    queryOptions({
      queryKey: ["restaurant", slug] as const,
      queryFn: ({ queryKey }) => getRestaurant(queryKey[1]),
      select: (data) => ({
        ...data,
        flavors: data.flavors.filter((flavor) => {
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );

          return new Date(flavor.date).getTime() >= today.getTime();
        }),
      }),
    }),
  restaurants: (data: LocateRestaurantsSchema) =>
    queryOptions({
      queryKey: ["restaurants", data] as const,
      queryFn: ({ queryKey }) => locate(queryKey[1]),
      enabled: false,
    }),
  nearbyRestaurants: (slug: string, data: LocateRestaurantsSchema) =>
    queryOptions({
      queryKey: ["nearby-restaurants", slug] as const,
      queryFn: () => locate(data),
      select: (data) => data.filter((restaurant) => restaurant.slug !== slug),
    }),
  flavor: (slug: string) =>
    queryOptions({
      queryKey: ["flavor", slug] as const,
      queryFn: ({ queryKey }) => getFlavor(queryKey[1]),
    }),
  flavors: () =>
    queryOptions({
      queryKey: ["flavors"] as const,
      queryFn: getAllFlavors,
    }),
};
