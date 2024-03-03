import { createRoute } from "@tanstack/react-router";

import { Component, PendingComponent } from "~/components/routes/flavors";
import { queryOptionsFactory } from "~/lib/query-options-factory";
import { rootRoute } from "~/routes/root";

export const flavorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flavors",
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(queryOptionsFactory.flavors()),
  component: Component,
  pendingComponent: PendingComponent,
});
