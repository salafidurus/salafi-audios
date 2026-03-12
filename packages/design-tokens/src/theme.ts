import { createColors, type AppColors } from "./colors";
import { createSpacing, type SpacingMobile, type SpacingWeb } from "./spacing";
import { createRadius, type RadiusMobile, type RadiusWeb } from "./radius";
import { createShadows, type ShadowsMobileTheme, type ShadowsWebTheme } from "./shadows";
import { createTypography, type TypographyMobile, type TypographyWeb } from "./typography";

export type AppThemeWeb = {
  colors: AppColors;
  spacing: SpacingWeb;
  radius: RadiusWeb;
  shadows: ShadowsWebTheme;
  typography: TypographyWeb;
};

export type AppThemeMobile = {
  colors: AppColors;
  spacing: SpacingMobile;
  radius: RadiusMobile;
  shadows: ShadowsMobileTheme;
  typography: TypographyMobile;
};

export function createTheme(mode: "light" | "dark", platform: "web"): AppThemeWeb;
export function createTheme(mode: "light" | "dark", platform: "mobile"): AppThemeMobile;
export function createTheme(mode: "light" | "dark", platform: "web" | "mobile") {
  if (platform === "web") {
    return {
      colors: createColors(mode),
      spacing: createSpacing("web"),
      radius: createRadius("web"),
      shadows: createShadows(mode, "web"),
      typography: createTypography("web"),
    };
  }

  return {
    colors: createColors(mode),
    spacing: createSpacing("mobile"),
    radius: createRadius("mobile"),
    shadows: createShadows(mode, "mobile"),
    typography: createTypography("mobile"),
  };
}

export const lightWebTheme = createTheme("light", "web");
export const darkWebTheme = createTheme("dark", "web");
export const lightMobileTheme = createTheme("light", "mobile");
export const darkMobileTheme = createTheme("dark", "mobile");

export type AppTheme = ReturnType<typeof createTheme>;
