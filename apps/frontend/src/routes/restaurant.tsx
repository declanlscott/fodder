import { createRoute, notFound } from "@tanstack/react-router";
import { HTTPError } from "ky";

import {
  Component,
  NotFoundComponent,
  PendingComponent,
} from "~/components/routes/restaurant";
import { queryOptionsFactory } from "~/lib/query-options-factory";
import { rootRoute } from "~/routes/root";

export const restaurantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurants/$slug",
  loader: async ({ context: { queryClient }, params }) => {
    try {
      const data = await queryClient.ensureQueryData(
        queryOptionsFactory.restaurant(params.slug),
      );

      return data;
    } catch (error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        throw notFound();
      }

      throw error;
    }
  },
  component: Component,
  pendingComponent: PendingComponent,
  notFoundComponent: NotFoundComponent,
});
