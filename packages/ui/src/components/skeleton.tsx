import { cn } from "../utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-muted animate-pulse rounded-md",
        "before:via-muted-foreground/30 relative isolate overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
