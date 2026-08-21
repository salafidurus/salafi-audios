import { createColors, type AppColors } from "@sd/design-tokens";

import { borderWeb, type BorderWeb } from "./border";
import { radiusWeb, type RadiusWeb } from "./radius";
import { createAccentRecipesWeb, type AccentRecipesWeb } from "./recipes";
import { createShadowsWeb, type ShadowsWebTheme } from "./shadows";
import { spacingWeb, type SpacingWeb } from "./spacing";
import { typographyWeb, type TypographyWeb } from "./typography";
import { buildAccentColors, ACCENT_PALETTES, type AccentThemeId } from "./variants";

export type { AccentThemeId } from "./variants";

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
 * Builds a web theme. Each accent theme palette declares its own base color
 * mode (parchment is light-mood; the rest dark-mood). The `mode` parameter
 * is only used for the light/dark base themes.
 */
export const createThemeWeb = (mode: "light" | "dark", variant?: AccentThemeId): AppThemeWeb => {
  if (variant) {
    const colorMode: "light" | "dark" = ACCENT_PALETTES[variant].mode;
    const colors = buildAccentColors(variant);
    const shadows = createShadowsWeb(colorMode);

    return {
      colors,
      recipes: createAccentRecipesWeb(colors, shadows.focus, colorMode),
      spacing: spacingWeb,
      radius: radiusWeb,
      border: borderWeb,
      shadows,
      typography: typographyWeb,
    };
  }

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

export const accentWebThemes = {
  parchment: createThemeWeb("light", "parchment"),
  manuscript: createThemeWeb("dark", "manuscript"),
  midnight: createThemeWeb("dark", "midnight"),
  ember: createThemeWeb("dark", "ember"),
} satisfies Record<AccentThemeId, AppThemeWeb>;
