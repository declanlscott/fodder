import { createRoute } from "@tanstack/react-router";

import { queryOptionsFactory } from "~/lib/queryOptionsFactory";
import { Flavor } from "~/pages/Flavor";
import { rootRoute } from "~/routes/root";

export const flavorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flavors/$slug",
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(queryOptionsFactory.flavor(params.slug)),
  component: () => <Flavor />,
});
