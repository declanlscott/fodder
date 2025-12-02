import React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "../utils";
import { buttonVariants } from "../variants/button";

import type { VariantProps } from "cva";

interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
