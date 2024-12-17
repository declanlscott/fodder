import { cn } from "../utils";

export type SkeletonProps = React.ComponentProps<"div">;

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-muted",
      "relative isolate overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-muted-foreground/30 before:to-transparent",
      className,
    )}
    {...props}
  />
);
