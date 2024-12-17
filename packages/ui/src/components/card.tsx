import * as React from "react";

import { cn } from "../utils";

interface CardProps extends React.ComponentProps<"div"> {
  withHoverStyles?: boolean;
}
export const Card = ({
  withHoverStyles = false,
  className,
  ...props
}: CardProps) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      withHoverStyles &&
        "group relative transition-colors duration-75 hover:bg-accent/75",
      className,
    )}
    {...props}
  />
);

type CardHeaderProps = React.ComponentProps<"div">;
export const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

type CardTitleProps = React.ComponentProps<"h3">;
export const CardTitle = ({ className, ...props }: CardTitleProps) => (
  <h3
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
);

type CardDescriptionProps = React.ComponentProps<"p">;
export const CardDescription = ({
  className,
  ...props
}: CardDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

type CardContentProps = React.ComponentProps<"div">;
export const CardContent = ({ className, ...props }: CardContentProps) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

type CardFooterProps = React.ComponentProps<"div">;
export const CardFooter = ({ className, ...props }: CardFooterProps) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
);
