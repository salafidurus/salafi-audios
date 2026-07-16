import { createColors, type AppColors } from "@sd/design-tokens";
import { createAccentRecipesWeb, type AccentRecipesWeb } from "./recipes";
import { spacingWeb, type SpacingWeb } from "./spacing";
import { radiusWeb, type RadiusWeb } from "./radius";
import { borderWeb, type BorderWeb } from "./border";
import { createShadowsWeb, type ShadowsWebTheme } from "./shadows";
import { typographyWeb, type TypographyWeb } from "./typography";

export type AppThemeWeb = {
  colors: AppColors;
  recipes: AccentRecipesWeb;
  spacing: SpacingWeb;
  radius: RadiusWeb;
  border: BorderWeb;
  shadows: ShadowsWebTheme;
  typography: TypographyWeb;
};

export const createThemeWeb = (mode: "light" | "dark"): AppThemeWeb => {
  const colors = createColors(mode);
  const shadows = createShadowsWeb(mode);

  return {
    colors,
    recipes: createAccentRecipesWeb(colors, shadows.focus, mode),
    spacing: spacingWeb,
    radius: radiusWeb,
    border: borderWeb,
    shadows,
    typography: typographyWeb,
  };
};

export const lightWebTheme = createThemeWeb("light");
export const darkWebTheme = createThemeWeb("dark");
