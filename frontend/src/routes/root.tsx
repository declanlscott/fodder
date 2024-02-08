import { lazy, Suspense } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  ScrollRestoration,
} from "@tanstack/react-router";

import { Layout } from "~/components/Layout";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

const rootRouteWithContext = createRootRouteWithContext<{
  queryClient: QueryClient;
}>();

export const rootRoute = rootRouteWithContext({
  component: () => (
    <>
      <Layout />

      <ScrollRestoration getKey={(location) => location.pathname} />

      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>

      <ReactQueryDevtools buttonPosition="top-right" />
    </>
  ),
});
