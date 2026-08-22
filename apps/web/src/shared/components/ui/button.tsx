import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@/shared/utils/index";

import { buttonVariants, type ButtonVariantProps } from "./button-variants";

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  label,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  ...props
}: React.ComponentProps<"button"> &
  Omit<ButtonVariantProps, "variant" | "size"> & {
    variant?: ButtonVariantProps["variant"] | "primary" | "surface" | "danger";
    size?: ButtonVariantProps["size"] | "md";
    asChild?: boolean;
    label?: string;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    fullWidth?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";
  const normalizedVariant: ButtonVariantProps["variant"] =
    variant === "primary"
      ? "default"
      : variant === "surface"
        ? "secondary"
        : variant === "danger"
          ? "destructive"
          : variant;
  const normalizedSize: ButtonVariantProps["size"] = size === "md" ? "default" : size;
  const content = label ?? props.children;

  return (
    <Comp
      data-slot="button"
      data-variant={normalizedVariant}
      data-size={normalizedSize}
      className={cn(
        buttonVariants({ variant: normalizedVariant, size: normalizedSize, className }),
        fullWidth && "w-full",
      )}
      {...props}
      aria-busy={loading || undefined}
      disabled={loading || props.disabled}
    >
      {asChild ? (
        props.children
      ) : loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {content}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </Comp>
  );
}

export { Button };
