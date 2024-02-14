import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { format, isToday } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import { Skeleton } from "~/components/ui/Skeleton";
import { RestaurantData } from "~/lib/types";
import { cn } from "~/lib/utils";

type UpcomingFodCardProps = {
  flavor: RestaurantData["flavors"][number];
};

export function UpcomingFodCard({ flavor }: UpcomingFodCardProps) {
  const [imageStatus, setImageStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const date = new Date(flavor.date);

  return (
    <Card
      className={cn(
        "group relative transition-colors duration-75 hover:bg-accent/75",
        isToday(date) && "bg-secondary text-secondary-foreground",
      )}
    >
      <CardHeader>
        <CardTitle>{format(date, "EEEE, MMMM d")}</CardTitle>
        <CardDescription>
          <Link
            to="/flavors/$slug"
            params={{ slug: flavor.slug }}
            className="after:absolute after:inset-0 group-hover:underline"
          >
            {flavor.slug === "z-restaurant-closed-today"
              ? "Restaurant Closed Today"
              : flavor.name}
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
