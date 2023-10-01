import DroppedCone from "~/components/DroppedCone";
import { Card } from "~/components/ui/Card";

export function SomethingWentWrongCard() {
  return (
    <Card className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
      <DroppedCone className="h-28 fill-muted-foreground" />
      {"Something went wrong..."}
    </Card>
  );
}
