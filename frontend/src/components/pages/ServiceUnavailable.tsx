import { Construction } from "lucide-react";

import { useTitle } from "~/lib/hooks";

export function ServiceUnavailable() {
  useTitle({ title: "Service Unavailable" });

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
      <Construction className="h-48 w-48" />

      <div className="flex flex-col items-center gap-2">
        <span className="text-9xl font-bold">503</span>
        <span className="text-center text-xl font-semibold">
          Service Unavailable.
        </span>
        <span className="text-center">
          Under reconstruction due to external API changes.
        </span>
      </div>
    </div>
  );
}
