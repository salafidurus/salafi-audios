import type { UniversalHostProps, UniversalStyle, UniversalTextStyle } from "@expo/ui";
import type { TypographyVariant } from "@sd/design-tokens";

import type { AppThemeNative } from "./theme";

/** Defines the pure native theme conversion boundary for Expo UI universal components. */

/** Restricts adapter input to the UniversalStyle properties supported by Expo UI 57. */
export type UniversalStyleInput = Partial<UniversalStyle>;

/** Describes the Host properties owned by the native theme boundary. */
export type UniversalHostPropsOutput = Pick<
  UniversalHostProps,
  "colorScheme" | "layoutDirection" | "ignoreSafeArea"
>;

/** Converts supported native box values without admitting React Native layout styles. */
export function toUniversalStyle(input: UniversalStyleInput): UniversalStyle {
  return { ...input };
}

/** Converts one native semantic typography variant into Expo UI text styling. */
export function toUniversalTextStyle(
  theme: AppThemeNative,
  variant: TypographyVariant,
  color?: string,
): UniversalTextStyle {
  const typography = theme.typography[variant];

  const textStyle: UniversalTextStyle = {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
    letterSpacing: typography.letterSpacing,
  };

  if (color !== undefined) textStyle.color = color;
  return textStyle;
}

/** Creates the root Host contract while preserving system appearance and app safe-area ownership. */
export function createUniversalHostProps(
  theme: Pick<AppThemeNative, "direction">,
  themeName: "system" | "light" | "dark" = "system",
): UniversalHostPropsOutput {
  const hostProps: UniversalHostPropsOutput = {
    layoutDirection: theme.direction === "rtl" ? "rightToLeft" : "leftToRight",
    ignoreSafeArea: "all",
  };

  if (themeName !== "system") hostProps.colorScheme = themeName;
  return hostProps;
}
