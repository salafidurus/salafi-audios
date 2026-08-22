import * as React from "react";

import { cn } from "@/shared/utils";

import { badgeVariants, type BadgeVariantProps } from "./badge-variants";

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & BadgeVariantProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge };
