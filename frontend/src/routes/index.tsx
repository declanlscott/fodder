import { createRoute } from "@tanstack/react-router";

import { Locate } from "~/pages/Locate";
import { rootRoute } from "~/routes/root";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Locate />,
});
