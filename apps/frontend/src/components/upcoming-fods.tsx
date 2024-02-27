import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Skeleton,
} from "@repo/ui";
import { Link } from "@tanstack/react-router";
import { format, isToday } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { SluggedRestaurant } from "@repo/types";

export function UpcomingFods({
  flavors,
}: {
  flavors: SluggedRestaurant["flavors"];
}) {
  const initialShowing = 5;
  const [showing, setShowing] = useState(initialShowing);

  const canShowMore = showing < flavors.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {flavors.slice(0, showing).map((flavor) => (
          <UpcomingFodCard key={flavor.date} flavor={flavor} />
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          className="w-full gap-2 md:w-fit"
          onClick={() =>
            setShowing((prev) => {
              if (!canShowMore) {
                return initialShowing;
              }

              const next = prev + 5;
              return next > flavors.length ? flavors.length : next;
            })
          }
        >
          {canShowMore ? (
            <>
              <ChevronDown />
              Show More
            </>
          ) : (
            <>
              <ChevronUp />
              Show Less
            </>
          )}
        </Button>
      </div>
    </>
  );
}

type UpcomingFodCardProps = {
  flavor: SluggedRestaurant["flavors"][number];
};

function UpcomingFodCard({ flavor }: UpcomingFodCardProps) {
  const [imageStatus, setImageStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const date = new Date(flavor.date);

  return (
    <Card
      withHoverStyles
      className={cn(isToday(date) && "bg-secondary text-secondary-foreground")}
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
