import type { TextStyle } from "react-native";

import { useUnistyles } from "react-native-unistyles";

/** Provides a reusable native UI primitive with a focused rendering contract. */
/** Defines the native button variant contract shared by its consumers. */
export type ButtonVariant = "primary" | "surface" | "outline" | "ghost" | "danger";
/** Defines the native button size contract shared by its consumers. */
export type ButtonSize = "sm" | "md" | "lg";

/** Defines the native theme contract shared by its consumers. */
export type Theme = ReturnType<typeof useUnistyles>["theme"];

/** Defines the native button tokens contract shared by its consumers. */
export type ButtonTokens = {
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  textColor: string;
  indicatorColor: string;
  borderRadius: number;
  paddingHorizontal: number;
  height: number;
  gap: number;
  labelStyle: TextStyle;
};

/** Explicit per-size height, applied as a native frame/height constraint on
 * both platforms — without it, the platform's own minimum tap-target sizing
 * (SwiftUI/Material) inflates the button well past its intended size. */
const HEIGHT_BY_SIZE = { sm: 32, md: 40, lg: 48 } satisfies Record<ButtonSize, number>;

/** Returns the the button tokens used by native consumers. */
export function getButtonTokens(variant: ButtonVariant, size: ButtonSize, t: Theme): ButtonTokens {
  const variantColors = getVariantColors(variant, t);
  const labelStyle = getLabelStyle(size, t);

  return {
    ...variantColors,
    borderRadius: t.radius.component.chip,
    paddingHorizontal: getPaddingHorizontal(size, t),
    height: HEIGHT_BY_SIZE[size],
    gap: size === "lg" ? t.spacing.component.gapMd : t.spacing.component.gapSm,
    labelStyle: { ...labelStyle, color: variantColors.textColor },
  };
}

function getVariantColors(
  variant: ButtonVariant,
  t: Theme,
): Pick<
  ButtonTokens,
  "backgroundColor" | "borderColor" | "borderWidth" | "textColor" | "indicatorColor"
> {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: t.recipes.primaryCta.backgroundColor,
        borderColor: t.recipes.primaryCta.borderColor,
        borderWidth: 1,
        textColor: t.recipes.primaryCta.textColor,
        indicatorColor: t.recipes.primaryCta.textColor,
      };
    case "surface":
      return {
        backgroundColor: t.colors.surface.elevated,
        borderColor: t.colors.border.default,
        borderWidth: 1,
        textColor: t.colors.content.default,
        indicatorColor: t.colors.content.muted,
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        borderColor: t.colors.border.default,
        borderWidth: 1.5,
        textColor: t.colors.content.default,
        indicatorColor: t.colors.content.muted,
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        textColor: t.colors.content.primary,
        indicatorColor: t.colors.content.primary,
      };
    case "danger":
      return {
        backgroundColor: t.colors.action.danger,
        borderColor: t.colors.state.dangerBorder,
        borderWidth: 1,
        textColor: t.colors.content.onDanger,
        indicatorColor: t.colors.content.onDanger,
      };
  }
}

function getPaddingHorizontal(size: ButtonSize, t: Theme): number {
  switch (size) {
    case "sm":
      return t.spacing.component.chipX;
    case "md":
      return t.spacing.scale.lg;
    case "lg":
      return t.spacing.scale.xl;
  }
}

function getLabelStyle(size: ButtonSize, t: Theme): TextStyle {
  switch (size) {
    case "sm":
      return { ...t.typography.bodySm };
    case "md":
      return { ...t.typography.labelMd };
    case "lg":
      return { ...t.typography.bodyLg };
  }
}
