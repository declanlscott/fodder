import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Skeleton,
} from "@repo/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { AlertTriangle } from "lucide-react";

import { NotFound } from "~/components/not-found";
import { useTitle } from "~/hooks/title";
import { queryOptionsFactory } from "~/lib/query-options-factory";

export const Route = createFileRoute("/flavors/$slug")({
  loader: async ({ context: { queryClient }, params }) => {
    try {
      const data = await queryClient.ensureQueryData(
        queryOptionsFactory.flavor(params.slug),
      );

      return data;
    } catch (error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        throw notFound();
      }

      throw error;
    }
  },
  component: function Component() {
    const { slug } = Route.useParams();
    const { data } = useSuspenseQuery(queryOptionsFactory.flavor(slug));

    useTitle({ title: data.name });

    const [imageStatus, setImageStatus] = useState<
      "loading" | "success" | "error"
    >("loading");

    const isClosed = slug === "z-restaurant-closed-today";

    return (
      <Card className="flex flex-col md:flex-row md:justify-between">
        <div className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-4xl">
              {isClosed ? "Restaurant Closed Today" : data.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-grow flex-col justify-between gap-8 pb-0 md:pb-6">
            <CardDescription className="text-xl">
              {data.description}
            </CardDescription>

            <div
              className={cn(
                "text-muted-foreground flex items-center justify-end gap-4",
                isClosed && "hidden",
              )}
            >
              <div className="flex flex-col">
                <span className="font-semibold">Allergens:</span>

                <ul className="flex flex-wrap gap-1">
                  {data.allergens.map((allergen, index) => (
                    <li key={index}>
                      {`${allergen}${
                        index < data.allergens.length - 1 ? "," : ""
                      }`}
                    </li>
                  ))}
                </ul>
              </div>

              <AlertTriangle className="h-10 w-10" />
            </div>
          </CardContent>
        </div>

        <div
          className={cn(
            "w-full shrink-0 md:w-2/5",
            imageStatus === "loading" && "p-8",
          )}
        >
          {imageStatus === "loading" ? (
            <Skeleton className="aspect-square" />
          ) : imageStatus === "success" ? (
            <img src={data.imageUrl} alt={data.name} />
          ) : null}

          <img
            src={data.imageUrl}
            onLoad={() => setImageStatus("success")}
            onError={() => setImageStatus("error")}
            className="hidden"
          />
        </div>
      </Card>
    );
  },
  pendingComponent: function PendingComponent() {
    useTitle({ title: "Loading Flavor..." });

    return (
      <Card className="flex flex-col md:flex-row md:justify-between">
        <div className="flex w-full flex-col">
          <CardHeader>
            <Skeleton className="h-9 w-4/5 sm:w-3/5" />
          </CardHeader>

          <CardContent className="flex flex-grow flex-col justify-between gap-8 pb-0 md:pb-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full sm:w-11/12" />
              <Skeleton className="h-5 w-11/12 sm:w-2/5" />
              <Skeleton className="h-5 w-2/3 sm:hidden" />
            </div>

            <div className="flex items-center justify-end gap-4 text-muted-foreground">
              <div className="flex flex-col">
                <span className="font-semibold">Allergens:</span>

                <ul className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <li key={index}>
                      <Skeleton className="h-4 w-8" />
                    </li>
                  ))}
                </ul>
              </div>

              <AlertTriangle className="h-10 w-10" />
            </div>
          </CardContent>
        </div>

        <div className="w-full shrink-0 p-8 md:w-2/5">
          <Skeleton className="aspect-square" />
        </div>
      </Card>
    );
  },
  notFoundComponent: () => <NotFound page="Flavor" />,
});
