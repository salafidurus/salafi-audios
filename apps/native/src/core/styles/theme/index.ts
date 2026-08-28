import type { AppColors } from "@sd/design-tokens";

import { createColors } from "@sd/design-tokens";

import { borderNative, type BorderNative } from "./border";
import { radiusNative, type RadiusNative } from "./radius";
import { createAccentRecipesNative, type AccentRecipesNative } from "./recipes";
import { createShadowsNative, type ShadowsNativeTheme } from "./shadows";
import { spacingNative, type SpacingNative } from "./spacing";
import { typographyNative, type TypographyNative } from "./typography";

/** Configures native themes, breakpoints, and the Unistyles runtime. */
/** Describes the complete native theme assembled from colors, recipes, metrics, and direction. */
export type AppThemeNative = {
  colors: AppColors;
  recipes: AccentRecipesNative;
  spacing: SpacingNative;
  radius: RadiusNative;
  border: BorderNative;
  shadows: ShadowsNativeTheme;
  typography: TypographyNative;
  direction: "ltr" | "rtl";
};

/** Builds the native theme theme values from the active platform mode. */
export const createThemeNative = (mode: "light" | "dark"): AppThemeNative => {
  const colors = createColors(mode);

  return {
    colors,
    recipes: createAccentRecipesNative(colors, colors.border.focus),
    spacing: spacingNative,
    radius: radiusNative,
    border: borderNative,
    shadows: createShadowsNative(mode),
    typography: typographyNative,
    direction: "ltr",
  };
};

/** Provides the light native theme used by the Unistyles light mode. */
export const lightNativeTheme = createThemeNative("light");
/** Provides the dark native theme used by the Unistyles dark mode. */
export const darkNativeTheme = createThemeNative("dark");
