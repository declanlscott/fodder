import { queryOptions } from "@tanstack/react-query";

import { getFlavor, getFlavors, getRestaurant } from "~/lib/fetchers";
import { RestaurantsData } from "~/lib/types";

import type { QueryClient } from "@tanstack/react-query";

export const queryOptionsFactory = {
  restaurant: (slug: string) =>
    queryOptions({
      queryKey: ["restaurant", slug],
      queryFn: ({ queryKey }) => getRestaurant(queryKey[1]),
    }),
  restaurants: (queryClient: QueryClient) =>
    queryOptions({
      queryKey: ["restaurants"],
      queryFn: ({ queryKey }) =>
        queryClient.getQueryData<RestaurantsData>(queryKey) ?? null,
    }),
  flavor: (slug: string) =>
    queryOptions({
      queryKey: ["flavor", slug],
      queryFn: ({ queryKey }) => getFlavor(queryKey[1]),
    }),
  flavors: queryOptions({
    queryKey: ["flavors"],
    queryFn: getFlavors,
  }),
};
