import type { ReactNode } from "react";

import { Button, Row, type ButtonProps, type UniversalStyle } from "@expo/ui";
import { type StyleProp, type ViewStyle } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { NativeText } from "./native-text";

/** Adapts semantic button actions and token styles to Expo UI Button. */

/** Product action variants mapped to Expo UI variants and token colors. */
export type NativeButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
/** Supported sizes, each preserving the platform minimum touch target. */
export type NativeButtonSize = "sm" | "md" | "lg";

/** Defines a token-aware semantic button independent of platform modifiers. */
export type NativeButtonProps = Omit<ButtonProps, "children" | "label" | "variant" | "style"> & {
  label: string | number;
  accessibilityLabel?: string;
  icon?: ReactNode;
  variant?: NativeButtonVariant;
  size?: NativeButtonSize;
  loading?: boolean;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Renders an accessible native action; loading also disables the action. */
export function NativeButton({
  label,
  icon,
  iconPosition = "left",
  fullWidth = false,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
  ...props
}: NativeButtonProps) {
  const { theme } = useUnistyles();
  const isDisabled = isButtonDisabled(disabled, loading);
  const textVariant = getButtonTextVariant(size);
  const nativeVariant = getExpoButtonVariant(variant);
  const accessibilityProps = getAccessibilityProps(accessibilityLabel);

  return (
    <Button
      {...props}
      {...accessibilityProps}
      label={getNativeButtonLabel(icon, label, loading)}
      disabled={isDisabled}
      variant={nativeVariant}
      // SAFETY: getButtonStyle only returns properties supported by Expo UI Button.
      style={getButtonStyle(size, variant, disabled, theme, style, fullWidth)}
    >
      {renderNativeButtonChildren(
        icon,
        iconPosition,
        label,
        loading,
        textVariant,
        variant,
        theme.spacing.component.gapSm,
      )}
    </Button>
  );
}

function getNativeButtonLabel(icon: ReactNode, label: string | number, loading: boolean) {
  return icon ? undefined : getButtonLabel(label, loading);
}

function renderNativeButtonChildren(
  icon: ReactNode,
  iconPosition: "left" | "right",
  label: string | number,
  loading: boolean,
  textVariant: "bodySm" | "bodyLg" | "labelMd",
  variant: NativeButtonVariant,
  gap: number,
) {
  return icon
    ? renderButtonContent(icon, iconPosition, label, loading, textVariant, variant, gap)
    : undefined;
}

function isButtonDisabled(disabled: boolean, loading: boolean) {
  return disabled || loading;
}

function getAccessibilityProps(accessibilityLabel: string | undefined) {
  return accessibilityLabel ? { accessibilityLabel } : {};
}

function getButtonStyle(
  size: NativeButtonSize,
  variant: NativeButtonVariant,
  disabled: boolean,
  theme: NativeTheme,
  style: NativeButtonProps["style"],
  fullWidth: boolean,
): ButtonProps["style"] {
  // SAFETY: callers provide RN layout styles; Expo UI consumes the overlapping
  // visual subset and ignores layout-only fields at this native boundary.
  const result: UniversalStyle = {
    height: getButtonHeight(size, theme),
    borderRadius: theme.radius.component.chip,
    backgroundColor: getButtonBackground(variant, theme),
    borderColor: theme.colors.border.default,
    borderWidth: variant === "ghost" ? 0 : theme.border.width.default,
    opacity: disabled ? 0.5 : undefined,
    width: fullWidth ? ("100%" as const) : undefined,
  };
  if (style && !Array.isArray(style)) Object.assign(result, style);
  return result;
}

function renderButtonContent(
  icon: ReactNode,
  iconPosition: "left" | "right",
  label: string | number,
  loading: boolean,
  textVariant: "bodySm" | "bodyLg" | "labelMd",
  variant: NativeButtonVariant,
  gap: number,
) {
  const text = (
    <NativeText variant={textVariant} colorRole={getButtonColorRole(variant)}>
      {getButtonLabel(label, loading)}
    </NativeText>
  );
  return (
    <Row alignment="center" spacing={gap}>
      {!loading && iconPosition === "left" ? icon : null}
      {text}
      {!loading && iconPosition === "right" ? icon : null}
    </Row>
  );
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

function getButtonLabel(label: string | number, loading: boolean) {
  return loading ? `${label}…` : String(label);
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
