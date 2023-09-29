import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import { Skeleton } from "~/components/ui/Skeleton";
import { Restaurant } from "~/lib/types";

type FodCardProps = {
  restaurant: Restaurant;
};

export function FodCard({ restaurant }: FodCardProps) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent">
      <CardHeader>
        <CardTitle>{restaurant.fod}</CardTitle>

        <CardDescription>{restaurant.name}</CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <img src={restaurant.fodImageUrl}></img>
      </CardContent>
    </Card>
  );
}

export function FodCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />

        <Skeleton className="mt-1.5 h-4 w-4/5" />
      </CardHeader>

      <CardContent>
        <Skeleton className="aspect-square w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
