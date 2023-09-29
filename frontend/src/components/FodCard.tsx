import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
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
