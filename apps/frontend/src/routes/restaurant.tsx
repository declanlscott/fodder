import { useSuspenseQuery } from "@tanstack/react-query";
import { createRoute, notFound } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { MapPin, Phone } from "lucide-react";

import { ErrorCard } from "~/components/error-card";
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

      return;
    }
  },
  notFoundComponent: () => <NotFound />,
  component: function Restaurant() {
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
