import { Card } from "@repo/ui";
import { useSuspenseQuery } from "@tanstack/react-query";

import { DroppedCone } from "~/components/dropped-cone";
import { FodCard } from "~/components/fod-card";
import { locate } from "~/lib/fetchers";

type NearbyFodsProps = {
  source: {
    slug: string;
    address: string;
  };
};

export function NearbyFods({ source: { slug, address } }: NearbyFodsProps) {
  const { data } = useSuspenseQuery({
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

  return isEmpty ? (
    <Card className="text-muted-foreground col-span-full flex h-64 flex-col items-center justify-center gap-4">
      <DroppedCone className="fill-muted-foreground h-28" />
      {"No locations found..."}
    </Card>
  ) : (
    data.map((restaurant) => (
      <FodCard key={restaurant.slug} restaurant={restaurant} />
    ))
  );
}
