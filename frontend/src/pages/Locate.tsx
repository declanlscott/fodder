import { useIsMutating } from "@tanstack/react-query";
import { Dessert } from "lucide-react";

import DroppedCone from "~/components/DroppedCone";
import { FodCard, FodCardSkeleton } from "~/components/FodCard";
import { LocateCard } from "~/components/LocateCard";
import { Card } from "~/components/ui/Card";
import { useRestaurants } from "~/lib/hooks";

export function LocatePage() {
  const { data } = useRestaurants();

  const isLoading = useIsMutating({ mutationKey: ["restaurants"] }) > 0;
  const isEmpty = (data?.length ?? -1) === 0;

  return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-1">
          <LocateCard />
        </div>

        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
              )) ?? (
                <Card className="col-span-full flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
                  <Dessert className="h-28 w-28 text-muted-foreground" />
                  {"Nothing to see here..."}
                </Card>
              )
            )}
          </div>
        </div>
      </div>
  );
}
