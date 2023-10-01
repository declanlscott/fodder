import { useState } from "react";
import { Link } from "react-router-dom";

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
  isToday: boolean;
};

export function UpcomingFodCard({ flavor, isToday }: UpcomingFodCardProps) {
  const [imageStatus, setImageStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  return (
    <Card
      className={cn(
        "group relative transition-colors duration-75 hover:bg-accent/75",
        isToday && "bg-secondary text-secondary-foreground",
      )}
    >
      <CardHeader>
        <CardTitle>{`${isToday ? "Today - " : ""}${flavor.date}`}</CardTitle>
        <CardDescription>
          <Link
            to={`/flavors/${flavor.slug}`}
            className="after:absolute after:inset-0 group-hover:underline"
          >
            {flavor.name}
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

type UpcomingFodCardSkeletonProps = {
  isToday: boolean;
};

export function UpcomingFodCardSkeleton({
  isToday,
}: UpcomingFodCardSkeletonProps) {
  return (
    <Card className={cn(isToday && "bg-secondary text-secondary-foreground")}>
      <CardHeader>
        <Skeleton className="h-6 w-4/5" />

        <Skeleton className="h-4 w-1/2" />
      </CardHeader>

      <CardContent>
        <Skeleton className="aspect-square w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
