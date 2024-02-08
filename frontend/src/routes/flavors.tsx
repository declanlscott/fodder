import { createRoute } from "@tanstack/react-router";

import { queryOptionsFactory } from "~/lib/queryOptionsFactory";
import { Flavors } from "~/pages/Flavors";
import { rootRoute } from "~/routes/root";

export const flavorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flavors",
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(queryOptionsFactory.flavors),
  component: () => <Flavors />,
});
