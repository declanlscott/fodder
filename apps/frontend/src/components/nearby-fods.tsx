import { Card } from "@repo/ui";
import { useQuery } from "@tanstack/react-query";

import { DroppedCone } from "~/components/dropped-cone";
import { FodCard, FodCardSkeleton } from "~/components/fod-card";
import { locate } from "~/lib/fetchers";

type NearbyFodsProps = {
  source: {
    slug: string;
    address: string;
  };
};

export function NearbyFods({ source: { slug, address } }: NearbyFodsProps) {
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
