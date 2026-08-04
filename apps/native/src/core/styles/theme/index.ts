import type { AppColors } from "@sd/design-tokens";

import { createColors } from "@sd/design-tokens";

import { borderNative, type BorderNative } from "./border";
import { radiusNative, type RadiusNative } from "./radius";
import { createAccentRecipesNative, type AccentRecipesNative } from "./recipes";
import { createShadowsNative, type ShadowsNativeTheme } from "./shadows";
import { spacingNative, type SpacingNative } from "./spacing";
import { typographyNative, type TypographyNative } from "./typography";

export type AppThemeNative = {
  mode: "light" | "dark";
  colors: AppColors;
  recipes: AccentRecipesNative;
  spacing: SpacingNative;
  radius: RadiusNative;
  border: BorderNative;
  shadows: ShadowsNativeTheme;
  typography: TypographyNative;
  direction: "ltr" | "rtl";
};

export const createThemeNative = (mode: "light" | "dark"): AppThemeNative => {
  const colors = createColors(mode);

  return {
    mode,
    colors,
    recipes: createAccentRecipesNative(colors, colors.border.focus),
    spacing: spacingNative,
    radius: radiusNative,
    border: borderNative,
    shadows: createShadowsNative(mode),
    typography: typographyNative,
    direction: "ltr",
  };
};

export const lightNativeTheme = createThemeNative("light");
export const darkNativeTheme = createThemeNative("dark");
