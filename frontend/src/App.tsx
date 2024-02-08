import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { ThemeProvider } from "~/components/ThemeProvider";
import { flavorRoute } from "~/routes/flavor";
import { flavorsRoute } from "~/routes/flavors";
import { indexRoute } from "~/routes/index";
import { notFoundRoute } from "~/routes/notFound";
import { restaurantRoute } from "~/routes/restaurant";
import { rootRoute } from "~/routes/root";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, refetchOnWindowFocus: false },
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  restaurantRoute,
  flavorRoute,
  flavorsRoute,
  notFoundRoute,
]);
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
