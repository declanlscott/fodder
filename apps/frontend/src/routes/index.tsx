import { createRoute } from "@tanstack/react-router";
import { fallback, parse } from "valibot";

import { Component } from "~/components/routes/index";
import { rootRoute } from "~/routes/root";
import { LocateRestaurantsSchema } from "~/schemas/locate-restaurants";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search) =>
    parse(
      fallback(LocateRestaurantsSchema, { type: "address", address: "" }),
      search,
    ),
  component: Component,
});
