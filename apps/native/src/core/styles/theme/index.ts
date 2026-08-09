import type { AppColors, AccentThemeId } from "@sd/design-tokens";

import { createColors, buildAccentColors, ACCENT_PALETTES } from "@sd/design-tokens";

import { borderNative, type BorderNative } from "./border";
import { radiusNative, type RadiusNative } from "./radius";
import { createAccentRecipesNative, type AccentRecipesNative } from "./recipes";
import { createShadowsNative, type ShadowsNativeTheme } from "./shadows";
import { spacingNative, type SpacingNative } from "./spacing";
import { typographyNative, type TypographyNative } from "./typography";

export type AppThemeNative = {
  colors: AppColors;
  recipes: AccentRecipesNative;
  spacing: SpacingNative;
  radius: RadiusNative;
  border: BorderNative;
  shadows: ShadowsNativeTheme;
  typography: TypographyNative;
  direction: "ltr" | "rtl";
};

export const createThemeNative = (
  mode: "light" | "dark",
  variant?: AccentThemeId,
): AppThemeNative => {
  const colors = variant ? buildAccentColors(variant) : createColors(mode);
  const colorMode = variant ? ACCENT_PALETTES[variant].mode : mode;

  return {
    colors,
    recipes: createAccentRecipesNative(colors, colors.border.focus),
    spacing: spacingNative,
    radius: radiusNative,
    border: borderNative,
    shadows: createShadowsNative(colorMode),
    typography: typographyNative,
    direction: "ltr",
  };
};

export const lightNativeTheme = createThemeNative("light");
export const darkNativeTheme = createThemeNative("dark");

export const parchmentNativeTheme = createThemeNative("light", "parchment");
export const manuscriptNativeTheme = createThemeNative("dark", "manuscript");
export const midnightNativeTheme = createThemeNative("dark", "midnight");
export const emberNativeTheme = createThemeNative("dark", "ember");
