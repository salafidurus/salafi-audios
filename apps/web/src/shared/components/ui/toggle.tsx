/** Documents this module's responsibility and public boundary. */
"use client";

import { Toggle as TogglePrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/shared/utils";

import { toggleVariants, type ToggleVariantProps } from "./toggle-variants";

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & ToggleVariantProps) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle };
