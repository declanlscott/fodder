import { queryOptions } from "@tanstack/react-query";

import { getFlavor, getFlavors, getRestaurant, locate } from "~/lib/fetchers";

import type { QueryClient } from "@tanstack/react-query";
import type { RestaurantsData } from "~/types/api";

export const queryOptionsFactory = {
  restaurant: (slug: string) =>
    queryOptions({
      queryKey: ["restaurant", slug],
      queryFn: ({ queryKey }) => getRestaurant(queryKey[1]),
    }),
  restaurants: {
    key: ["restaurants"] as const,
    mutation: () => ({
      mutationKey: queryOptionsFactory.restaurants.key,
      mutationFn: locate,
    }),
    query: (queryClient: QueryClient) =>
      queryOptions({
        queryKey: queryOptionsFactory.restaurants.key,
        queryFn: ({ queryKey }) =>
          queryClient.getQueryData<RestaurantsData>(queryKey) ?? null,
      }),
  },
  flavor: (slug: string) =>
    queryOptions({
      queryKey: ["flavor", slug],
      queryFn: ({ queryKey }) => getFlavor(queryKey[1]),
    }),
  flavors: () =>
    queryOptions({
      queryKey: ["flavors"],
      queryFn: getFlavors,
    }),
};
