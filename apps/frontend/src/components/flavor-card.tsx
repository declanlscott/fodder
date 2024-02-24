import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Skeleton,
} from "@repo/ui";
import { Link } from "@tanstack/react-router";

import type { AllFlavors } from "@repo/types";

type FlavorCardProps = {
  flavor: AllFlavors[number];
};

export function FlavorCard({ flavor }: FlavorCardProps) {
  const [imageStatus, setImageStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  return (
    <Card withHoverStyles>
      <CardHeader>
        <CardTitle>
          <Link
            to="/flavors/$slug"
            params={{ slug: flavor.slug }}
            className="after:absolute after:inset-0 group-hover:underline"
          >
            {flavor.name}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent
        className={cn(
          "flex justify-center",
          imageStatus !== "loading" && "pb-0",
        )}
      >
        {imageStatus === "loading" ? (
          <Skeleton className="aspect-square w-full rounded-md" />
        ) : imageStatus === "success" ? (
          <img src={flavor.imageUrl} alt={flavor.name} />
        ) : null}

        <img
          src={flavor.imageUrl}
          onLoad={() => setImageStatus("success")}
          onError={() => setImageStatus("error")}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
