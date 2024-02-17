import { Card } from "@repo/ui/components/card";

import { DroppedCone } from "~/components/dropped-cone";

export function ErrorCard() {
  return (
    <Card className="text-muted-foreground flex h-64 flex-col items-center justify-center gap-4">
      <DroppedCone className="fill-muted-foreground h-28" />
      {"Something went wrong..."}
    </Card>
  );
}
