import type {
  AppColors,
  AccentBadgeRecipe,
  AccentRecipesShared,
  ScreenWashRecipe,
  ChromeRecipe,
} from "@sd/design-tokens";

/** Documents this module's responsibility and public boundary. */
export type AccentRecipesWeb = AccentRecipesShared & {
  primaryCta: AccentRecipesShared["primaryCta"] & {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
  };
  primarySubtleSurface: AccentRecipesShared["primarySubtleSurface"] & {
    background: string;
  };
  secondarySubtleSurface: AccentRecipesShared["secondarySubtleSurface"] & {
    background: string;
  };
  mixedHeroSurface: AccentRecipesShared["mixedHeroSurface"] & {
    background: string;
  };
  mixedPromotedPanel: AccentRecipesShared["mixedPromotedPanel"] & {
    background: string;
  };
  badge: AccentRecipesShared["badge"] & {
    warning: AccentBadgeRecipe;
  };
  screen: ScreenWashRecipe;
  chrome: ChromeRecipe;
};

function createGradientPair(start: string, end: string): [string, string] {
  return [start, end];
}

function modeValue(isDark: boolean, darkValue: string, lightValue: string): string {
  return isDark ? darkValue : lightValue;
}

const createLayeredBackground = (
  radial: AccentRecipesShared["primaryCta"]["radial"],
  linear: AccentRecipesShared["primaryCta"]["linear"],
): string =>
  `radial-gradient(circle at ${Math.round(radial.center.x * 100)}% ${Math.round(
    radial.center.y * 100,
  )}%, ${radial.centerColor}, ${radial.edgeColor} ${Math.round(
    radial.radius * 100,
  )}%), linear-gradient(${Math.round(Math.atan2(linear.end.y - linear.start.y, linear.end.x - linear.start.x) * (180 / Math.PI) - 90)}deg, ${linear.colors[0]}, ${linear.colors[1]})`;

export const createAccentRecipesWeb = (
  colors: AppColors,
  focusRingColor: string,
  mode: "light" | "dark",
): AccentRecipesWeb => {
  const isDark = mode === "dark";
  const primaryCta = {
    backgroundColor: colors.action.primary,
    borderColor: colors.border.primaryStrong,
    borderColorHover: colors.action.primaryHover,
    textColor: colors.content.onPrimary,
    shadowColor: colors.border.primaryStrong,
    shadowColorPressed: colors.action.primaryActive,
    linear: {
      colors: createGradientPair(colors.action.primary, colors.action.primaryHover),
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    radial: {
      center: { x: 0.18, y: 0.22 },
      radius: 0.6,
      centerColor: `color-mix(in srgb, ${colors.border.primaryStrong} 58%, transparent)`,
      edgeColor: "transparent",
    },
  };

  const primarySubtleSurface = {
    backgroundColor: colors.surface.primarySubtle,
    borderColor: colors.border.primary,
    textColor: colors.content.primaryStrong,
    linear: {
      colors: createGradientPair(
        `color-mix(in srgb, ${colors.surface.primarySubtle} 96%, ${colors.surface.default})`,
        colors.surface.default,
      ),
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    radial: {
      center: { x: 0.14, y: 0.16 },
      radius: 0.7,
      centerColor: `color-mix(in srgb, ${colors.border.primaryStrong} 24%, transparent)`,
      edgeColor: "transparent",
    },
  };

  const secondarySubtleSurface = {
    backgroundColor: colors.surface.secondarySubtle,
    borderColor: colors.border.secondary,
    textColor: colors.content.secondaryStrong,
    linear: {
      colors: createGradientPair(
        `color-mix(in srgb, ${colors.surface.secondarySubtle} 96%, ${colors.surface.default})`,
        colors.surface.default,
      ),
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    radial: {
      center: { x: 0.82, y: 0.18 },
      radius: 0.68,
      centerColor: `color-mix(in srgb, ${colors.border.secondaryStrong} 22%, transparent)`,
      edgeColor: "transparent",
    },
  };

  const mixedHeroSurface = {
    backgroundColor: colors.surface.default,
    borderColor: colors.border.default,
    textColor: colors.content.strong,
    linear: {
      colors: createGradientPair(
        `color-mix(in srgb, ${colors.surface.primarySubtle} 78%, ${colors.surface.default})`,
        `color-mix(in srgb, ${colors.surface.secondarySubtle} 58%, ${colors.surface.default})`,
      ),
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    radial: {
      center: { x: 0.12, y: 0.12 },
      radius: 0.72,
      centerColor: `color-mix(in srgb, ${colors.border.primaryStrong} 24%, transparent)`,
      edgeColor: "transparent",
    },
  };

  const mixedPromotedPanel = {
    backgroundColor: colors.surface.default,
    borderColor: colors.border.primary,
    textColor: colors.content.strong,
    linear: {
      colors: createGradientPair(
        `color-mix(in srgb, ${colors.surface.primarySubtle} 62%, ${colors.surface.default})`,
        `color-mix(in srgb, ${colors.surface.secondarySubtle} 42%, ${colors.surface.default})`,
      ),
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    radial: {
      center: { x: 0.86, y: 0.14 },
      radius: 0.66,
      centerColor: `color-mix(in srgb, ${colors.border.primaryStrong} 18%, transparent)`,
      edgeColor: "transparent",
    },
  };

  return {
    primaryCta: {
      ...primaryCta,
      background: createLayeredBackground(primaryCta.radial, primaryCta.linear),
      backgroundHover: createLayeredBackground(
        {
          ...primaryCta.radial,
          centerColor: `color-mix(in srgb, ${colors.border.primaryStrong} 68%, transparent)`,
        },
        { ...primaryCta.linear, colors: [colors.action.primaryHover, colors.action.primaryActive] },
      ),
      backgroundActive: createLayeredBackground(
        {
          ...primaryCta.radial,
          centerColor: `color-mix(in srgb, ${colors.border.primaryStrong} 72%, transparent)`,
        },
        { ...primaryCta.linear, colors: [colors.action.primaryHover, colors.action.primaryActive] },
      ),
    },
    primarySubtleSurface: {
      ...primarySubtleSurface,
      background: createLayeredBackground(primarySubtleSurface.radial, primarySubtleSurface.linear),
    },
    secondarySubtleSurface: {
      ...secondarySubtleSurface,
      background: createLayeredBackground(
        secondarySubtleSurface.radial,
        secondarySubtleSurface.linear,
      ),
    },
    mixedHeroSurface: {
      ...mixedHeroSurface,
      background: createLayeredBackground(mixedHeroSurface.radial, mixedHeroSurface.linear),
    },
    selectedSurface: {
      backgroundColor: colors.surface.selected,
      contentColor: colors.content.primaryStrong,
    },
    selectedContent: colors.content.primaryStrong,
    secondarySupportingBadge: {
      surfaceColor: colors.surface.secondarySubtle,
      borderColor: colors.border.secondary,
      foregroundColor: colors.content.secondaryStrong,
    },
    badge: {
      primary: {
        surfaceColor: colors.surface.primarySubtle,
        borderColor: colors.border.primary,
        foregroundColor: colors.content.primaryStrong,
      },
      secondary: {
        surfaceColor: colors.surface.secondarySubtle,
        borderColor: colors.border.secondary,
        foregroundColor: colors.content.secondaryStrong,
      },
      success: {
        surfaceColor: `color-mix(in srgb, ${colors.action.primaryHover} 20%, ${colors.surface.default})`,
        borderColor: `color-mix(in srgb, ${colors.action.primary} 40%, ${colors.border.default})`,
        foregroundColor: `color-mix(in srgb, ${colors.action.primary} 80%, ${colors.content.strong})`,
      },
      warning: {
        surfaceColor: colors.surface.secondarySubtle,
        borderColor: colors.border.secondary,
        foregroundColor: colors.content.secondaryStrong,
      },
      danger: {
        surfaceColor: `color-mix(in srgb, #ef4444 20%, ${colors.surface.default})`,
        borderColor: `color-mix(in srgb, #ef4444 40%, ${colors.border.default})`,
        foregroundColor: `color-mix(in srgb, #ef4444 80%, ${colors.content.strong})`,
      },
    },
    mixedPromotedPanel: {
      ...mixedPromotedPanel,
      background: createLayeredBackground(mixedPromotedPanel.radial, mixedPromotedPanel.linear),
    },
    dividerColor: `color-mix(in srgb, ${colors.border.default} 82%, transparent)`,
    focusRingColor,
    screen: {
      washPrimary: `radial-gradient(circle at 12% 14%, color-mix(in srgb, ${colors.surface.primarySubtle} ${modeValue(isDark, "70%", "100%")}, transparent), transparent 42%)`,
      washSecondary: `radial-gradient(circle at 14% 14%, color-mix(in srgb, ${colors.surface.secondarySubtle} ${modeValue(isDark, "70%", "100%")}, transparent), transparent 40%)`,
      washMixed: `radial-gradient(circle at 14% 12%, color-mix(in srgb, ${colors.surface.primarySubtle} ${modeValue(isDark, "64%", "94%")}, transparent), transparent 38%), radial-gradient(circle at 88% 10%, color-mix(in srgb, ${colors.surface.secondarySubtle} ${modeValue(isDark, "62%", "90%")}, transparent), transparent 32%)`,
    },
    chrome: {
      surface: `color-mix(in srgb, ${colors.surface.elevated} ${modeValue(isDark, "92%", "88%")}, transparent)`,
      surfaceStrong: `color-mix(in srgb, ${colors.surface.elevated} ${modeValue(isDark, "96%", "93%")}, transparent)`,
      border: `color-mix(in srgb, ${colors.border.subtle} ${modeValue(isDark, "82%", "88%")}, transparent)`,
      borderStrong: `color-mix(in srgb, ${colors.border.default} ${modeValue(isDark, "84%", "82%")}, transparent)`,
      hoverAccentSurface: `color-mix(in srgb, ${colors.surface.primarySubtle} ${modeValue(isDark, "54%", "72%")}, ${colors.surface.subtle})`,
      inputBorderRest: `color-mix(in srgb, ${colors.border.default} ${modeValue(isDark, "76%", "84%")}, transparent)`,
    },
  };
};
