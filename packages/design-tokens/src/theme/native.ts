import { createColors, type AppColors } from "../colors/shared";
import { createAccentRecipesNative, type AccentRecipesNative } from "../recipes/native";
import { spacingMobile, type SpacingMobile } from "../spacing/native";
import { radiusMobile, type RadiusMobile } from "../radius/native";
import { createShadowsMobile, type ShadowsMobileTheme } from "../shadows/native";
import { typographyMobile, type TypographyMobile } from "../typography/native";

export type AppThemeMobile = {
  colors: AppColors;
  recipes: AccentRecipesNative;
  spacing: SpacingMobile;
  radius: RadiusMobile;
  shadows: ShadowsMobileTheme;
  typography: TypographyMobile;
};

export const createThemeMobile = (mode: "light" | "dark"): AppThemeMobile => {
  const colors = createColors(mode);

  return {
    colors,
    recipes: createAccentRecipesNative(colors, colors.border.focus),
    spacing: spacingMobile,
    radius: radiusMobile,
    shadows: createShadowsMobile(mode),
    typography: typographyMobile,
  };
};

export const lightMobileTheme = createThemeMobile("light");
export const darkMobileTheme = createThemeMobile("dark");
