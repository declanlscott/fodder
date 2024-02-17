import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";

import { FlavorCard } from "~/components/flavor-card";
import { useTitle } from "~/hooks/title";
import { queryOptionsFactory } from "~/lib/query-options-factory";
import { rootRoute } from "~/routes/root";

export const flavorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/flavors",
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(queryOptionsFactory.flavors()),
  component: () => {
    const { data } = useSuspenseQuery(queryOptionsFactory.flavors());

    useTitle({ title: "Flavors" });

    return (
      <>
        <h1 className="mb-8 text-4xl font-bold tracking-tight">Flavors</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((flavor) => (
            <FlavorCard key={flavor.slug} flavor={flavor} />
          ))}
        </div>
      </>
    );
  },
});
