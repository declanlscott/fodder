import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";

import { cn } from "../utils";
import { toggleVariants } from "../variants/toggle";

import type { VariantProps } from "cva";

type ToggleProps = React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>;
export const Toggle = ({ className, variant, size, ...props }: ToggleProps) => (
  <TogglePrimitive.Root
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
);
