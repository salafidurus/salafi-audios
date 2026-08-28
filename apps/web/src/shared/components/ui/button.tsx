import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@/shared/utils/index";

import { buttonVariants, type ButtonVariantProps } from "./button-variants";

/** Maps the app's semantic button names onto the underlying shadcn variants. */
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

function resolveButtonComponent(asChild: boolean) {
  return asChild ? Slot.Root : "button";
}

function resolveButtonSize(size: ButtonVariantProps["size"] | "md") {
  return size === "md" ? "default" : size;
}

function resolveButtonDisabled(loading: boolean, disabled: boolean | undefined) {
  return loading || disabled;
}

type ButtonProps = React.ComponentProps<"button"> &
  Omit<ButtonVariantProps, "variant" | "size"> & {
    variant?: ButtonVariantProps["variant"] | "primary" | "surface" | "danger";
    size?: ButtonVariantProps["size"] | "md";
    asChild?: boolean;
    label?: string;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    fullWidth?: boolean;
  };

function renderButton({
  className,
  variant,
  size,
  asChild,
  label,
  loading,
  icon,
  iconPosition,
  fullWidth,
  ...props
}: Required<
  Pick<ButtonProps, "variant" | "size" | "asChild" | "loading" | "iconPosition" | "fullWidth">
> &
  Omit<ButtonProps, "variant" | "size" | "asChild" | "loading" | "iconPosition" | "fullWidth">) {
  const Comp = resolveButtonComponent(asChild);
  const normalizedVariant = normalizeButtonVariant(variant);
  const normalizedSize: ButtonVariantProps["size"] = resolveButtonSize(size);
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
      disabled={resolveButtonDisabled(loading, props.disabled)}
    >
      {renderButtonContent(asChild, loading, props.children, icon, iconPosition, content)}
    </Comp>
  );
}

function Button(props: ButtonProps) {
  return renderButton({
    ...props,
    variant: props.variant ?? "default",
    size: props.size ?? "default",
    asChild: props.asChild ?? false,
    loading: props.loading ?? false,
    iconPosition: props.iconPosition ?? "left",
    fullWidth: props.fullWidth ?? false,
  });
}

export { Button };
