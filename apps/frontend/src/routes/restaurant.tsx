import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/utils";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import { format, isToday } from "date-fns";
import { ChevronDown, ChevronUp, MapPin, Phone } from "lucide-react";

import { DroppedCone } from "~/components/dropped-cone";
import { ErrorCard } from "~/components/error-card";
import { FodCard, FodCardSkeleton } from "~/components/fod-card";
import { useTitle } from "~/hooks/title";
import { locate } from "~/lib/fetchers";
import { queryOptionsFactory } from "~/lib/query-options-factory";
import { rootRoute } from "~/routes/root";

import type { RestaurantData } from "~/types/api";

export const restaurantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurants/$slug",
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(queryOptionsFactory.restaurant(params.slug)),
  component: () => {
    const { slug } = restaurantRoute.useParams();
    const { data } = useSuspenseQuery(queryOptionsFactory.restaurant(slug));

    useTitle({ title: data.name });

    if (!data) {
      return <ErrorCard />;
    }

    const address = `${data.address} ${data.city}, ${data.state} ${data.zipCode}`;

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <h1 className="text-4xl font-bold tracking-tight">{data.name}</h1>

          <div className="text-muted-foreground flex flex-col gap-1 sm:items-end">
            <div className="flex flex-row items-center gap-2 sm:flex-row-reverse">
              <MapPin className="text-primary h-5 w-5 shrink-0" />

              <span className="sm:text-end">{address}</span>
            </div>

            <div className="flex flex-row items-center gap-2 sm:flex-row-reverse">
              <Phone className="text-primary h-5 w-5 shrink-0" />

              <span>{data.phoneNumber}</span>
            </div>
          </div>
        </div>

        <UpcomingFods key={slug} flavors={data.flavors} />

        <h2 className="text-3xl font-bold tracking-tight">
          Nearby Flavors Of The Day
        </h2>

        <NearbyFods source={{ slug, address }} />
      </div>
    );
  },
});

function UpcomingFods({ flavors }: { flavors: RestaurantData["flavors"] }) {
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
  flavor: RestaurantData["flavors"][number];
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

type NearbyFodsProps = {
  source: {
    slug: string;
    address: string;
  };
};

function NearbyFods({ source: { slug, address } }: NearbyFodsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["restaurants", address],
    queryFn: () =>
      locate({
        location: {
          type: "address",
          address,
        },
      }),
    select: (data) => data.filter((restaurant) => restaurant.slug !== slug),
  });

  const isEmpty = (data?.length ?? -1) === 0;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <FodCardSkeleton key={index} />
        ))
      ) : isEmpty ? (
        <Card className="text-muted-foreground col-span-full flex h-64 flex-col items-center justify-center gap-4">
          <DroppedCone className="fill-muted-foreground h-28" />
          {"No locations found..."}
        </Card>
      ) : (
        data?.map((restaurant) => (
          <FodCard key={restaurant.slug} restaurant={restaurant} />
        ))
      )}
    </div>
  );
}
