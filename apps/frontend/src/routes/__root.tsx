import { lazy, Suspense } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  ScrollRestoration,
} from "@tanstack/react-router";

import { Layout } from "~/components/layout";
import { NotFound } from "~/components/not-found";

import type { QueryClient } from "@tanstack/react-query";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null // Render nothing in production
  : lazy(() =>
      // Lazy load in development
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
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
    notFoundComponent: () => <NotFound />,
  },
);
