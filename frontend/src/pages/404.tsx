import DroppedCone from "~/components/DroppedCone";

export function NotFoundPage() {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
      <DroppedCone className="w-48" />

      <div className="flex flex-col items-center gap-2">
        <span className="text-9xl font-bold">404</span>
        <span className="text-center text-xl">Page not found.</span>
      </div>
    </div>
  );
}
