import { createRoute } from "@tanstack/react-router";

import { NotFound } from "~/components/pages/NotFound";
import { rootRoute } from "~/routes/root";

export const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <NotFound />,
});
