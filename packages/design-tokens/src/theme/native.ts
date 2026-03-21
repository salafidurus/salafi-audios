import { createColors, type AppColors } from "../colors/shared";
import { spacingMobile, type SpacingMobile } from "../spacing/native";
import { radiusMobile, type RadiusMobile } from "../radius/native";
import { createShadowsMobile, type ShadowsMobileTheme } from "../shadows/native";
import { typographyMobile, type TypographyMobile } from "../typography/native";

export type AppThemeMobile = {
  colors: AppColors;
  spacing: SpacingMobile;
  radius: RadiusMobile;
  shadows: ShadowsMobileTheme;
  typography: TypographyMobile;
};

export const createThemeMobile = (mode: "light" | "dark"): AppThemeMobile => {
  return {
    colors: createColors(mode),
    spacing: spacingMobile,
    radius: radiusMobile,
    shadows: createShadowsMobile(mode),
    typography: typographyMobile,
  };
};

export const lightMobileTheme = createThemeMobile("light");
export const darkMobileTheme = createThemeMobile("dark");
