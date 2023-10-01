import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Route, Routes } from "react-router-dom";

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

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LocatePage />} />
            <Route path="/restaurants/:slug" element={<RestaurantPage />} />
            <Route path="/flavors" element={<FlavorsPage />} />
            <Route path="/flavors/:slug" element={<FlavorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
