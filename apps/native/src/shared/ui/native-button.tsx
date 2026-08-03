import { Button, Row, type ButtonProps } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import type { NativeIconName } from "./native-icon-sources";

import { NativeIcon } from "./native-icon";
import { NativeText } from "./native-text";

export type NativeButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
export type NativeButtonSize = "sm" | "md" | "lg";

export type NativeButtonProps = Omit<ButtonProps, "children" | "label" | "variant"> & {
  label: string;
  icon?: NativeIconName;
  variant?: NativeButtonVariant;
  size?: NativeButtonSize;
  loading?: boolean;
};

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
  const colors = getButtonColors(variant, theme);
  const height = getButtonHeight(size, theme);
  const textVariant = size === "sm" ? "bodySm" : size === "lg" ? "bodyLg" : "labelMd";

  return (
    <Button
      {...props}
      disabled={disabled || loading}
      variant={variant === "ghost" ? "text" : variant === "outline" ? "outlined" : "filled"}
      style={{
        height,
        paddingHorizontal: getHorizontalPadding(size, theme),
        borderRadius: theme.radius.component.chip,
        borderWidth: colors.borderWidth,
        borderColor: colors.borderColor,
        backgroundColor: colors.backgroundColor,
        opacity: disabled ? theme.border.width.default / theme.spacing.scale.xs : undefined,
        ...style,
      }}
    >
      <Row alignment="center" spacing={theme.spacing.component.gapSm}>
        {icon ? (
          <NativeIcon
            name={icon}
            color={colors.contentColor}
            size={theme.typography[textVariant].fontSize}
          />
        ) : null}
        <NativeText variant={textVariant} textStyle={{ color: colors.contentColor }}>
          {loading ? `${label}…` : label}
        </NativeText>
      </Row>
    </Button>
  );
}

type Theme = ReturnType<typeof useUnistyles>["theme"];

function getButtonHeight(size: NativeButtonSize, theme: Theme): number {
  const minimumTouchTarget = theme.spacing.scale["4xl"] + theme.spacing.scale.xs;
  if (size === "lg") return minimumTouchTarget + theme.spacing.scale.sm;
  if (size === "md") return minimumTouchTarget + theme.spacing.scale.xs;
  return minimumTouchTarget;
}

function getHorizontalPadding(size: NativeButtonSize, theme: Theme): number {
  if (size === "lg") return theme.spacing.scale.xl;
  if (size === "md") return theme.spacing.scale.lg;
  return theme.spacing.component.chipX;
}

function getButtonColors(variant: NativeButtonVariant, theme: Theme) {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: theme.colors.action.primary,
        borderColor: theme.colors.border.focus,
        borderWidth: theme.border.width.default,
        contentColor: theme.colors.content.onPrimary,
      };
    case "danger":
      return {
        backgroundColor: theme.colors.action.danger,
        borderColor: theme.colors.state.dangerBorder,
        borderWidth: theme.border.width.default,
        contentColor: theme.colors.content.onDanger,
      };
    case "surface":
      return {
        backgroundColor: theme.colors.surface.elevated,
        borderColor: theme.colors.border.default,
        borderWidth: theme.border.width.default,
        contentColor: theme.colors.content.default,
      };
    case "outline":
      return {
        backgroundColor: theme.colors.surface.canvas,
        borderColor: theme.colors.border.default,
        borderWidth: theme.border.width.default,
        contentColor: theme.colors.content.default,
      };
    case "ghost":
      return {
        backgroundColor: theme.colors.surface.canvas,
        borderColor: theme.colors.surface.canvas,
        borderWidth: undefined,
        contentColor: theme.colors.content.primary,
      };
  }
}
