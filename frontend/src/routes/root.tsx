import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { Layout } from "~/components/Layout";

const rootRouteWithContext = createRootRouteWithContext<{
  queryClient: QueryClient;
}>();

export const rootRoute = rootRouteWithContext({
  component: () => (
    <>
      <Layout />
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="top-right" />
    </>
  ),
});
