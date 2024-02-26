import { createRoute } from "@tanstack/react-router";

import { NotFound } from "~/components/not-found";
import { rootRoute } from "~/routes/root";

export const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "404",
  component: () => <NotFound />,
});
