import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Skeleton,
} from "@repo/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { NotFound } from "~/components/not-found";
import { useTitle } from "~/hooks/title";
import { queryOptionsFactory } from "~/lib/query-options-factory";

import type { AllFlavors } from "@repo/types";

export const Route = createFileRoute("/flavors")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(queryOptionsFactory.flavors()),
  component: function Component() {
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
  pendingComponent: function PendingComponent() {
    useTitle({ title: "Loading Flavors..." });

    return (
      <>
        <h1 className="mb-8 text-4xl font-bold tracking-tight">Flavors</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-2/3" />
              </CardHeader>

              <CardContent>
                <Skeleton className="aspect-[80/71] w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  },
  notFoundComponent: () => <NotFound page="Flavors" />,
});

type FlavorCardProps = {
  flavor: AllFlavors[number];
};

function FlavorCard({ flavor }: FlavorCardProps) {
  const [imageStatus, setImageStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  return (
    <Card withHoverStyles>
      <CardHeader>
        <CardTitle>
          <Link
            to="/flavors/$slug"
            params={{ slug: flavor.slug }}
            className="after:absolute after:inset-0 group-hover:underline"
          >
            {flavor.name}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent
        className={cn(
          "flex justify-center",
          imageStatus !== "loading" && "pb-0",
        )}
      >
        {imageStatus === "loading" ? (
          <Skeleton className="aspect-[80/71] w-full rounded-md" />
        ) : imageStatus === "success" ? (
          <img src={flavor.imageUrl} alt={flavor.name} />
        ) : null}

        <img
          src={flavor.imageUrl}
          onLoad={() => setImageStatus("success")}
          onError={() => setImageStatus("error")}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
