"use client";

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/shared/utils";

import { toggleVariants, type ToggleVariantProps } from "./toggle-variants";

function ToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    />
  );
}

function ToggleGroupItem({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & ToggleVariantProps) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
