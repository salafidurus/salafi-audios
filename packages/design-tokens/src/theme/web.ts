import { createColors, type AppColors } from "../colors/shared";
import { createAccentRecipesWeb, type AccentRecipesWeb } from "../recipes/web";
import { spacingWeb, type SpacingWeb } from "../spacing/web";
import { radiusWeb, type RadiusWeb } from "../radius/web";
import { createShadowsWeb, type ShadowsWebTheme } from "../shadows/web";
import { typographyWeb, type TypographyWeb } from "../typography/web";

export type AppThemeWeb = {
  colors: AppColors;
  recipes: AccentRecipesWeb;
  spacing: SpacingWeb;
  radius: RadiusWeb;
  shadows: ShadowsWebTheme;
  typography: TypographyWeb;
};

export const createThemeWeb = (mode: "light" | "dark"): AppThemeWeb => {
  const colors = createColors(mode);
  const shadows = createShadowsWeb(mode);

  return {
    colors,
    recipes: createAccentRecipesWeb(colors, shadows.focus),
    spacing: spacingWeb,
    radius: radiusWeb,
    shadows,
    typography: typographyWeb,
  };
};

export const lightWebTheme = createThemeWeb("light");
export const darkWebTheme = createThemeWeb("dark");
