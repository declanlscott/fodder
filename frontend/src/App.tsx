import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Layout } from "~/components/Layout";
import { ThemeProvider } from "~/components/ThemeProvider";
import { NotFoundPage } from "~/pages/404";
import { FlavorPage } from "~/pages/Flavor";
import { FlavorsPage } from "~/pages/Flavors";
import { LocatePage } from "~/pages/Locate";
import { RestaurantPage } from "~/pages/Restaurant";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, refetchOnWindowFocus: false },
  },
});

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LocatePage /> },
      { path: "/restaurants/:slug", element: <RestaurantPage /> },
      { path: "/flavors", element: <FlavorsPage /> },
      { path: "/flavors/:slug", element: <FlavorPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
