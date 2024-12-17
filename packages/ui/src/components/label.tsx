import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "../utils";
import { labelVariants } from "../variants/label";

import type { VariantProps } from "cva";

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>;
export const Label = ({ className, ...props }: LabelProps) => (
  <LabelPrimitive.Root className={cn(labelVariants(), className)} {...props} />
);
