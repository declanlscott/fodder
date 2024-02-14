import { useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, MapPin, Phone } from "lucide-react";

import DroppedCone from "~/components/DroppedCone";
import { FodCard, FodCardSkeleton } from "~/components/FodCard";
import { SomethingWentWrongCard } from "~/components/SomethingWentWrongCard";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { UpcomingFodCard } from "~/components/UpcomingFodCard";
import { locate } from "~/lib/fetchers";
import { useTitle } from "~/lib/hooks";
import { queryOptionsFactory } from "~/lib/queryOptionsFactory";
import { restaurantRoute } from "~/routes/restaurant";

import type { RestaurantData } from "~/lib/types";

export function Restaurant() {
  const { slug } = restaurantRoute.useParams();
  const { data } = useSuspenseQuery(queryOptionsFactory.restaurant(slug));

  useTitle({ title: data.name });

  if (!data) {
    return <SomethingWentWrongCard />;
  }

  const address = `${data.address} ${data.city}, ${data.state} ${data.zipCode}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <h1 className="text-4xl font-bold tracking-tight">{data.name}</h1>

        <div className="flex flex-col gap-1 text-muted-foreground sm:items-end">
          <div className="flex flex-row items-center gap-2 sm:flex-row-reverse">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />

            <span className="sm:text-end">{address}</span>
          </div>

          <div className="flex flex-row items-center gap-2 sm:flex-row-reverse">
            <Phone className="h-5 w-5 shrink-0 text-primary" />

            <span>{data.phoneNumber}</span>
          </div>
        </div>
      </div>

      <UpcomingFlavors key={slug} flavors={data.flavors} />

      <h2 className="text-3xl font-bold tracking-tight">
        Nearby Flavors Of The Day
      </h2>

      <NearbyFods source={{ slug, address }} />
    </div>
  );
}

function UpcomingFlavors({ flavors }: { flavors: RestaurantData["flavors"] }) {
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
        <Card className="col-span-full flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
          <DroppedCone className="h-28 fill-muted-foreground" />
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
