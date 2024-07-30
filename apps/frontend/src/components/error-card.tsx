import { Card, cn } from "@fodder/ui";

import { DroppedCone } from "~/components/dropped-cone";

export function ErrorCard(props: { className?: string }) {
  return (
    <Card
      className={cn(
        "text-muted-foreground flex h-64 flex-col items-center justify-center gap-4",
        props.className,
      )}
    >
      <DroppedCone className="fill-muted-foreground h-28" />
      Something went wrong...
    </Card>
  );
}
