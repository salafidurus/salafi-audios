import { createColors, type AppColors } from "../colors/shared";
import { spacingWeb, type SpacingWeb } from "../spacing/web";
import { radiusWeb, type RadiusWeb } from "../radius/web";
import { createShadowsWeb, type ShadowsWebTheme } from "../shadows/web";
import { typographyWeb, type TypographyWeb } from "../typography/web";

export type AppThemeWeb = {
  colors: AppColors;
  spacing: SpacingWeb;
  radius: RadiusWeb;
  shadows: ShadowsWebTheme;
  typography: TypographyWeb;
};

export const createThemeWeb = (mode: "light" | "dark"): AppThemeWeb => {
  return {
    colors: createColors(mode),
    spacing: spacingWeb,
    radius: radiusWeb,
    shadows: createShadowsWeb(mode),
    typography: typographyWeb,
  };
};

export const lightWebTheme = createThemeWeb("light");
export const darkWebTheme = createThemeWeb("dark");
