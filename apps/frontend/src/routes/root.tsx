import { lazy, Suspense } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  Navigate,
  ScrollRestoration,
} from "@tanstack/react-router";

import { Layout } from "~/components/layout";

import type { QueryClient } from "@tanstack/react-query";

// eslint-disable-next-line react-refresh/only-export-components
const TanStackRouterDevtools = import.meta.env.PROD
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
  notFoundComponent: () => <Navigate to="/404" />,
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
