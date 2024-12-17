import React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "../utils";
import { buttonVariants } from "../variants/button";

import type { VariantProps } from "cva";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ref?: React.RefObject<HTMLButtonElement | null>;
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
}
