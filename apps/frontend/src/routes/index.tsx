import { createRoute } from "@tanstack/react-router";
import { equals } from "remeda";
import { fallback, parse } from "valibot";

import { Component } from "~/components/routes/index";
import { queryOptionsFactory } from "~/lib/query-options-factory";
import { rootRoute } from "~/routes/root";
import {
  initialSearch,
  LocateRestaurantsSchema,
} from "~/schemas/locate-restaurants";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search) =>
    parse(fallback(LocateRestaurantsSchema, initialSearch), search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search }, context: { queryClient } }) => {
    if (equals(search, initialSearch)) {
      return;
    }

    await queryClient.ensureQueryData(queryOptionsFactory.restaurants(search));
  },
  component: Component,
});
