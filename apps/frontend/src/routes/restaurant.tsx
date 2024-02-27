import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent, CardHeader, cn, Skeleton } from "@repo/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute, notFound } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { MapPin, Phone } from "lucide-react";

import { ErrorCard } from "~/components/error-card";
import { FodCardSkeleton } from "~/components/fod-card";
import { NearbyFods } from "~/components/nearby-fods";
import { NotFound } from "~/components/not-found";
import { UpcomingFods } from "~/components/upcoming-fods";
import { useTitle } from "~/hooks/title";
import { queryOptionsFactory } from "~/lib/query-options-factory";
import { rootRoute } from "~/routes/root";

export const restaurantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurants/$slug",
  loader: async ({ context: { queryClient }, params }) => {
    try {
      const data = await queryClient.ensureQueryData(
        queryOptionsFactory.restaurant(params.slug),
      );

      return data;
    } catch (error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        throw notFound();
      }

      throw error;
    }
  },
  component: function Restaurant() {
    const { slug } = restaurantRoute.useParams();
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
              <NearbyFods source={{ slug, address }} />
            </Suspense>
          </div>
        </ErrorBoundary>
      </div>
    );
  },
  notFoundComponent: () => <NotFound />,
  pendingComponent: () => (
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
  ),
});
