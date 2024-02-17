import { Card } from "@repo/ui/components/card";
import { useIsMutating, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { Dessert } from "lucide-react";

import { DroppedCone } from "~/components/dropped-cone";
import { FodCard, FodCardSkeleton } from "~/components/fod-card";
import { LocateForm } from "~/components/locate-form";
import { queryOptionsFactory } from "~/lib/query-options-factory";
import { rootRoute } from "~/routes/root";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    const queryClient = useQueryClient();
    const { data } = useQuery(
      queryOptionsFactory.restaurants.query(queryClient),
    );

    const isPending = useIsMutating({ mutationKey: ["restaurants"] }) > 0;
    const isEmpty = (data?.length ?? -1) === 0;

    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-1">
          <LocateForm />
        </div>

        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {isPending ? (
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
              )) ?? (
                <Card className="text-muted-foreground col-span-full flex h-64 flex-col items-center justify-center gap-4">
                  <Dessert className="text-muted-foreground h-28 w-28" />
                  {"Nothing here yet..."}
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    );
  },
});
