import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@/shared/utils/index";

import { buttonVariants, type ButtonVariantProps } from "./button-variants";

function normalizeButtonVariant(
  variant: ButtonVariantProps["variant"] | "primary" | "surface" | "danger",
) {
  if (variant === "primary") return "default";
  if (variant === "surface") return "secondary";
  if (variant === "danger") return "destructive";
  return variant;
}

function renderButtonContent(
  asChild: boolean,
  loading: boolean,
  children: React.ReactNode,
  icon: React.ReactNode,
  iconPosition: "left" | "right",
  content: React.ReactNode,
) {
  if (asChild) return children;
  if (loading) {
    return (
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
    );
  }
  return (
    <>
      {icon && iconPosition === "left" && icon}
      {content}
      {icon && iconPosition === "right" && icon}
    </>
  );
}

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
  const normalizedVariant = normalizeButtonVariant(variant);
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
      {renderButtonContent(asChild, loading, props.children, icon, iconPosition, content)}
    </Comp>
  );
}

export { Button };
