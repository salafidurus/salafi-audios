import { createColors, type AppColors } from "@sd/design-tokens";

import { borderWeb, type BorderWeb } from "./border";
import { radiusWeb, type RadiusWeb } from "./radius";
import { createAccentRecipesWeb, type AccentRecipesWeb } from "./recipes";
import { createShadowsWeb, type ShadowsWebTheme } from "./shadows";
import { spacingWeb, type SpacingWeb } from "./spacing";
import { typographyWeb, type TypographyWeb } from "./typography";
import { buildAccentColors, type AccentThemeId } from "./variants";

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
 * Builds a web theme. When `variant` is a named accent theme the palette is fully
 * self-contained (dark-mood) and the `mode` selector only affects the `default`
 * variant.
 */
export const createThemeWeb = (
  mode: "light" | "dark",
  variant: AccentThemeId = "default",
): AppThemeWeb => {
  const isAccent = variant !== "default";
  const colorMode: "light" | "dark" = isAccent ? "dark" : mode;
  const colors = isAccent ? buildAccentColors(variant) : createColors(mode);
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
};

export const lightWebTheme = createThemeWeb("light");
export const darkWebTheme = createThemeWeb("dark");

export const accentWebThemes: Record<Exclude<AccentThemeId, "default">, AppThemeWeb> = {
  manuscript: createThemeWeb("dark", "manuscript"),
  midnight: createThemeWeb("dark", "midnight"),
  ember: createThemeWeb("dark", "ember"),
};
