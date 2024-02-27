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
import { Link } from "@tanstack/react-router";

import type { LocatedRestaurant } from "@repo/types";

type FodCardProps = {
  restaurant: LocatedRestaurant;
};

export function FodCard({ restaurant }: FodCardProps) {
  const [imageStatus, setImageStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  return (
    <Card withHoverStyles>
      <CardHeader>
        <CardTitle>
          <Link
            to="/flavors/$slug"
            params={{ slug: restaurant.fod.slug }}
            className="after:absolute after:inset-0 group-hover:underline"
          >
            {restaurant.fod.name}
          </Link>
        </CardTitle>

        <CardDescription className="z-10">
          <Link
            to="/restaurants/$slug"
            params={{ slug: restaurant.slug }}
            className="hover:underline"
          >
            {restaurant.name}
          </Link>
        </CardDescription>
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
          <img src={restaurant.fod.imageUrl} alt={restaurant.fod.name} />
        ) : null}

        <img
          src={restaurant.fod.imageUrl}
          onLoad={() => setImageStatus("success")}
          onError={() => setImageStatus("error")}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}

export function FodCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />

        <Skeleton className="mt-1.5 h-4 w-4/5" />
      </CardHeader>

      <CardContent>
        <Skeleton className="aspect-[80/71] w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
