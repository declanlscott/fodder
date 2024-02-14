import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

import { SomethingWentWrongCard } from "~/components/SomethingWentWrongCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import { Skeleton } from "~/components/ui/Skeleton";
import { useTitle } from "~/lib/hooks";
import { queryOptionsFactory } from "~/lib/queryOptionsFactory";
import { cn } from "~/lib/utils";
import { flavorRoute } from "~/routes/flavor";

export function Flavor() {
  const { slug } = flavorRoute.useParams();
  const { data } = useSuspenseQuery(queryOptionsFactory.flavor(slug));

  useTitle({ title: data.name });

  const [imageStatus, setImageStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  if (!data) {
    return <SomethingWentWrongCard />;
  }

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
              "flex items-center justify-end gap-4 text-muted-foreground",
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
}
