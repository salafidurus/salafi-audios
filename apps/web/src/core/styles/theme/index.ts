import { createColors, type AppColors } from "@sd/design-tokens";

import { borderWeb, type BorderWeb } from "./border";
import { radiusWeb, type RadiusWeb } from "./radius";
import { createAccentRecipesWeb, type AccentRecipesWeb } from "./recipes";
import { createShadowsWeb, type ShadowsWebTheme } from "./shadows";
import { spacingWeb, type SpacingWeb } from "./spacing";
import { typographyWeb, type TypographyWeb } from "./typography";

/** Documents this module's responsibility and public boundary. */
export type AppThemeWeb = {
  colors: AppColors;
  recipes: AccentRecipesWeb;
  spacing: SpacingWeb;
  radius: RadiusWeb;
  border: BorderWeb;
  shadows: ShadowsWebTheme;
  typography: TypographyWeb;
};

/**
 * Builds one of the two supported web themes.
 */
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
