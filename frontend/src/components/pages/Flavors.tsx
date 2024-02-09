import { useSuspenseQuery } from "@tanstack/react-query";

import { FlavorCard, FlavorCardSkeleton } from "~/components/FlavorCard";
import { useTitle } from "~/lib/hooks";
import { queryOptionsFactory } from "~/lib/queryOptionsFactory";

export function Flavors() {
  const { data, isLoading } = useSuspenseQuery(queryOptionsFactory.flavors());

  useTitle({ title: "Flavors" });

  return (
    <>
      <h1 className="mb-8 text-4xl font-bold tracking-tight">Flavors</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <FlavorCardSkeleton key={index} />
            ))
          : data?.map((flavor) => (
              <FlavorCard key={flavor.slug} flavor={flavor} />
            ))}
      </div>
    </>
  );
}
