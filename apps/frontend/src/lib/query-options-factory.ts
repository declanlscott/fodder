import { queryOptions } from "@tanstack/react-query";

import {
  getAllFlavors,
  getFlavor,
  getRestaurant,
  locate,
} from "~/lib/fetchers";

import type { LocatedRestaurant } from "@repo/types";
import type { QueryClient } from "@tanstack/react-query";

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
          queryClient.getQueryData<LocatedRestaurant[]>(queryKey) ?? null,
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
      queryFn: getAllFlavors,
    }),
};
