import { createColors, type AppColors } from "../colors/shared";
import { createAccentRecipesNative, type AccentRecipesNative } from "../recipes/native";
import { spacingNative, type SpacingNative } from "../spacing/native";
import { radiusNative, type RadiusNative } from "../radius/native";
import { createShadowsNative, type ShadowsNativeTheme } from "../shadows/native";
import { typographyNative, type TypographyNative } from "../typography/native";

export type AppThemeNative = {
  colors: AppColors;
  recipes: AccentRecipesNative;
  spacing: SpacingNative;
  radius: RadiusNative;
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
    shadows: createShadowsNative(mode),
    typography: typographyNative,
  };
};

export const lightNativeTheme = createThemeNative("light");
export const darkNativeTheme = createThemeNative("dark");
