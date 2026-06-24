import { createColors } from "@sd/design-tokens";
import type { AppColors } from "@sd/design-tokens";
import { createAccentRecipesNative, type AccentRecipesNative } from "./recipes";
import { spacingNative, type SpacingNative } from "./spacing";
import { radiusNative, type RadiusNative } from "./radius";
import { borderNative, type BorderNative } from "./border";
import { createShadowsNative, type ShadowsNativeTheme } from "./shadows";
import { typographyNative, type TypographyNative } from "./typography";

export type AppThemeNative = {
  colors: AppColors;
  recipes: AccentRecipesNative;
  spacing: SpacingNative;
  radius: RadiusNative;
  border: BorderNative;
  shadows: ShadowsNativeTheme;
  typography: TypographyNative;
};

export const createThemeNative = (mode: "light" | "dark"): AppThemeNative => {
  const colors = createColors(mode);

  return {
    colors,
    recipes: createAccentRecipesNative(colors, colors.border.focus),
    spacing: spacingNative,
    radius: radiusNative,
    border: borderNative,
    shadows: createShadowsNative(mode),
    typography: typographyNative,
  };
};

export const lightNativeTheme = createThemeNative("light");
export const darkNativeTheme = createThemeNative("dark");
