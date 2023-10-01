import { useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/Card";
import { Skeleton } from "~/components/ui/Skeleton";
import { FlavorsData } from "~/lib/types";
import { cn } from "~/lib/utils";

type FlavorCardProps = {
  flavor: FlavorsData[number];
};

export function FlavorCard({ flavor }: FlavorCardProps) {
  const [imageStatus, setImageStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  return (
    <Card className="group relative transition-colors duration-75 hover:bg-accent/75">
      <CardHeader>
        <CardTitle>
          <Link
            to={`/flavors/${flavor.slug}`}
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
          <Skeleton className="aspect-square w-full rounded-md" />
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

export function FlavorCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
      </CardHeader>

      <CardContent>
        <Skeleton className="aspect-square w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
