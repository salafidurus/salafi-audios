import { createColors, type AppColors } from "@sd/design-tokens";

import { borderWeb, type BorderWeb } from "./border";
import { radiusWeb, type RadiusWeb } from "./radius";
import { createAccentRecipesWeb, type AccentRecipesWeb } from "./recipes";
import { createShadowsWeb, type ShadowsWebTheme } from "./shadows";
import { spacingWeb, type SpacingWeb } from "./spacing";
import { typographyWeb, type TypographyWeb } from "./typography";

/** Documents this module's responsibility and public boundary. */
/** Complete web theme contract consumed by components and CSS generation. */
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

/** Fully resolved light theme used by the default web appearance. */
export const lightWebTheme = createThemeWeb("light");
/** Fully resolved dark theme used by the dark web appearance. */
export const darkWebTheme = createThemeWeb("dark");
