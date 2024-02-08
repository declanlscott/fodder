import { createRoute } from "@tanstack/react-router";

import { queryOptionsFactory } from "~/lib/queryOptionsFactory";
import { Restaurant } from "~/pages/Restaurant";
import { rootRoute } from "~/routes/root";

export const restaurantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurants/$slug",
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(queryOptionsFactory.restaurant(params.slug)),
  component: () => <Restaurant />,
});
