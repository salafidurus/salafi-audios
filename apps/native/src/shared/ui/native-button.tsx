import { Button, Row, type ButtonProps } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import type { NativeIconName } from "./native-icon-sources";

import { NativeIcon } from "./native-icon";
import { NativeText } from "./native-text";

/** Adapts semantic button actions and token styles to Expo UI Button. */

/** Product action variants mapped to Expo UI variants and token colors. */
export type NativeButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
/** Supported sizes, each preserving the platform minimum touch target. */
export type NativeButtonSize = "sm" | "md" | "lg";

/** Defines a token-aware semantic button independent of platform modifiers. */
export type NativeButtonProps = Omit<ButtonProps, "children" | "label" | "variant"> & {
  label: string;
  icon?: NativeIconName;
  variant?: NativeButtonVariant;
  size?: NativeButtonSize;
  loading?: boolean;
};

/** Renders an accessible native action; loading also disables the action. */
export function NativeButton({
  label,
  icon,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  ...props
}: NativeButtonProps) {
  const { theme } = useUnistyles();
  const isDisabled = isButtonDisabled(disabled, loading);
  const textVariant = getButtonTextVariant(size);
  const nativeVariant = getExpoButtonVariant(variant);

  return (
    <Button
      {...props}
      disabled={isDisabled}
      variant={nativeVariant}
      style={getButtonStyle(size, variant, disabled, theme, style)}
    >
      <Row alignment="center" spacing={theme.spacing.component.gapSm}>
        {icon ? <NativeIcon name={icon} colorRole={getButtonIconRole(variant)} /> : null}
        <NativeText variant={textVariant} colorRole={getButtonColorRole(variant)}>
          {getButtonLabel(label, loading)}
        </NativeText>
      </Row>
    </Button>
  );
}

function isButtonDisabled(disabled: boolean, loading: boolean) {
  return disabled || loading;
}

function getButtonStyle(
  size: NativeButtonSize,
  variant: NativeButtonVariant,
  disabled: boolean,
  theme: NativeTheme,
  style: NativeButtonProps["style"],
) {
  return {
    height: getButtonHeight(size, theme),
    borderRadius: theme.radius.component.chip,
    backgroundColor: getButtonBackground(variant, theme),
    borderColor: theme.colors.border.default,
    borderWidth: variant === "ghost" ? 0 : theme.border.width.default,
    opacity: disabled ? 0.5 : undefined,
    ...style,
  };
}

function getButtonTextVariant(size: NativeButtonSize) {
  if (size === "sm") return "bodySm" as const;
  if (size === "lg") return "bodyLg" as const;
  return "labelMd" as const;
}

function getExpoButtonVariant(variant: NativeButtonVariant) {
  if (variant === "ghost") return "text" as const;
  if (variant === "outline") return "outlined" as const;
  return "filled" as const;
}

function getButtonColorRole(variant: NativeButtonVariant) {
  return variant === "primary" || variant === "danger"
    ? ("onAction" as const)
    : ("default" as const);
}

function getButtonLabel(label: string, loading: boolean) {
  return loading ? `${label}…` : label;
}

function getButtonIconRole(variant: NativeButtonVariant) {
  return variant === "primary" || variant === "danger"
    ? ("onAction" as const)
    : ("default" as const);
}

type NativeTheme = ReturnType<typeof useUnistyles>["theme"];

function getButtonHeight(size: NativeButtonSize, theme: NativeTheme): number {
  if (size === "lg") return theme.spacing.scale["4xl"] + theme.spacing.scale.lg;
  if (size === "sm") return theme.spacing.scale["4xl"];
  return theme.spacing.scale["4xl"] + theme.spacing.scale.xs;
}

function getButtonBackground(variant: NativeButtonVariant, theme: NativeTheme): string {
  switch (variant) {
    case "primary":
      return theme.colors.action.primary;
    case "danger":
      return theme.colors.action.danger;
    case "surface":
      return theme.colors.surface.elevated;
    case "outline":
    case "ghost":
      return theme.colors.surface.canvas;
  }
}
