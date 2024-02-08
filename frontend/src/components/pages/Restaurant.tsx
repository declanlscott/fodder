import { useEffect, useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { MapPin, Phone } from "lucide-react";

import DroppedCone from "~/components/DroppedCone";
import { FodCard, FodCardSkeleton } from "~/components/FodCard";
import { SomethingWentWrongCard } from "~/components/SomethingWentWrongCard";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/Collapsible";
import { Skeleton } from "~/components/ui/Skeleton";
import {
  UpcomingFodCard,
  UpcomingFodCardSkeleton,
} from "~/components/UpcomingFodCard";
import { locate } from "~/lib/fetchers";
import { queryOptionsFactory } from "~/lib/queryOptionsFactory";
import { restaurantRoute } from "~/routes/restaurant";

export function Restaurant() {
  const { slug } = restaurantRoute.useParams();
  const { data, isLoading } = useSuspenseQuery(
    queryOptionsFactory.restaurant(slug),
  );

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [slug]);

  if (isLoading) {
    return <RestaurantDetailsSkeleton />;
  }

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

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.flavors.slice(0, 5).map((flavor) => (
            <UpcomingFodCard key={flavor.date} flavor={flavor} />
          ))}
          <CollapsibleContent asChild>
            <>
              {data.flavors.slice(5).map((flavor) => (
                <UpcomingFodCard key={flavor.date} flavor={flavor} />
              ))}
            </>
          </CollapsibleContent>
        </div>

        <CollapsibleTrigger asChild>
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" className="w-full md:w-fit">
              {isOpen ? "Show Less" : `Show ${data.flavors.length - 5} More`}
            </Button>
          </div>
        </CollapsibleTrigger>
      </Collapsible>

      <h2 className="text-3xl font-bold tracking-tight">
        Nearby Flavors Of The Day
      </h2>

      <NearbyFods source={{ slug, address }} />
    </div>
  );
}

function RestaurantDetailsSkeleton() {
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
          <UpcomingFodCardSkeleton key={index} isToday={index === 0} />
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
