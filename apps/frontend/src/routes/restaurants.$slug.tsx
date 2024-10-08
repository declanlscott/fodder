import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Skeleton,
} from "@fodder/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { format, isToday } from "date-fns";
import { ChevronDown, ChevronUp, MapPin, Phone } from "lucide-react";

import { DroppedCone } from "~/components/dropped-cone";
import { ErrorCard } from "~/components/error-card";
import { FodCard, FodCardSkeleton } from "~/components/fod-card";
import { NotFound } from "~/components/not-found";
import { useTitle } from "~/hooks/title";
import { HttpError } from "~/lib/errors";
import { queryOptionsFactory } from "~/lib/query-options-factory";

import type { SluggedRestaurant } from "@fodder/schemas";

export const Route = createFileRoute("/restaurants/$slug")({
  loader: async ({ context: { queryClient }, params }) => {
    try {
      const data = await queryClient.ensureQueryData(
        queryOptionsFactory.restaurant(params.slug),
      );

      return data;
    } catch (error) {
      if (error instanceof HttpError && error.statusCode === 404)
        throw notFound();

      throw error;
    }
  },
  component: function Component() {
    const { slug } = Route.useParams();
    const { data } = useSuspenseQuery(queryOptionsFactory.restaurant(slug));

    useTitle({ title: data.name });

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

        <ErrorBoundary fallback={<ErrorCard />}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Suspense
              fallback={Array.from({ length: 3 }).map((_, index) => (
                <FodCardSkeleton key={index} />
              ))}
            >
              <NearbyFods source={{ slug, address: data.zipCode }} />
            </Suspense>
          </div>
        </ErrorBoundary>
      </div>
    );
  },
  pendingComponent: function PendingComponent() {
    useTitle({ title: "Loading Restaurant..." });

    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="w-full space-y-2">
            <Skeleton className="h-9 w-full sm:w-2/3 md:w-1/2" />
            <Skeleton className="h-9 w-2/5 sm:hidden" />
          </div>

          <div className="flex flex-col gap-1 text-muted-foreground sm:items-end">
            <div className="flex flex-row items-center gap-2 sm:flex-row-reverse">
              <MapPin className="h-5 w-5 shrink-0 text-primary" />

              <Skeleton className="h-4 w-32" />
            </div>

            <div className="flex flex-row items-center gap-2 sm:flex-row-reverse">
              <Phone className="h-5 w-5 shrink-0 text-primary" />

              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              className={cn(
                index === 0 && "bg-secondary text-secondary-foreground",
              )}
            >
              <CardHeader>
                <Skeleton className="h-6 w-4/5" />

                <Skeleton className="h-4 w-1/2" />
              </CardHeader>

              <CardContent>
                <Skeleton className="aspect-[80/71] w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-3xl font-bold tracking-tight">
          Nearby Flavors Of The Day
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <FodCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  },
  notFoundComponent: () => <NotFound page="Restaurant" />,
});

function UpcomingFods({ flavors }: { flavors: SluggedRestaurant["flavors"] }) {
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
              if (!canShowMore) return initialShowing;

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

  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

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

type NearbyFodsProps = {
  source: {
    slug: string;
    address: string;
  };
};

function NearbyFods({ source: { slug, address } }: NearbyFodsProps) {
  const { data } = useSuspenseQuery(
    queryOptionsFactory.nearbyRestaurants(slug, { type: "address", address }),
  );

  if (data.length === 0)
    return (
      <Card className="text-muted-foreground col-span-full flex h-64 flex-col items-center justify-center gap-4">
        <DroppedCone className="fill-muted-foreground h-28" />
        {"No locations found..."}
      </Card>
    );

  return data.map((restaurant) => (
    <FodCard key={restaurant.slug} restaurant={restaurant} />
  ));
}
