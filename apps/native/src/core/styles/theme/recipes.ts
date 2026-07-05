import type { AppColors, AccentRecipesShared } from "@sd/design-tokens";

export type AccentRecipesNative = AccentRecipesShared;

export const createAccentRecipesNative = (
  colors: AppColors,
  focusRingColor: string,
): AccentRecipesNative => {
  return {
    primaryCta: {
      backgroundColor: colors.action.primary,
      borderColor: colors.border.primaryStrong,
      borderColorHover: colors.action.primaryHover,
      textColor: colors.content.onPrimary,
      shadowColor: colors.border.primaryStrong,
      shadowColorPressed: colors.action.primaryActive,
      linear: {
        colors: [colors.action.primary, colors.action.primaryHover],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      radial: {
        center: { x: 0.18, y: 0.22 },
        radius: 0.6,
        centerColor: colors.border.primaryStrong,
        edgeColor: "transparent",
      },
    },
    primarySubtleSurface: {
      backgroundColor: colors.surface.primarySubtle,
      borderColor: colors.border.primary,
      textColor: colors.content.primaryStrong,
      linear: {
        colors: [colors.surface.primarySubtle, colors.surface.default],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      radial: {
        center: { x: 0.14, y: 0.16 },
        radius: 0.72,
        centerColor: colors.border.primaryStrong,
        edgeColor: "transparent",
      },
    },
    secondarySubtleSurface: {
      backgroundColor: colors.surface.secondarySubtle,
      borderColor: colors.border.secondary,
      textColor: colors.content.secondaryStrong,
      linear: {
        colors: [colors.surface.secondarySubtle, colors.surface.default],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      radial: {
        center: { x: 0.82, y: 0.18 },
        radius: 0.68,
        centerColor: colors.border.secondaryStrong,
        edgeColor: "transparent",
      },
    },
    mixedHeroSurface: {
      backgroundColor: colors.surface.default,
      borderColor: colors.border.default,
      textColor: colors.content.strong,
      linear: {
        colors: [colors.surface.primarySubtle, colors.surface.secondarySubtle],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      radial: {
        center: { x: 0.12, y: 0.12 },
        radius: 0.72,
        centerColor: colors.border.primaryStrong,
        edgeColor: "transparent",
      },
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
        surfaceColor: colors.surface.primarySubtle,
        borderColor: colors.border.primary,
        foregroundColor: colors.content.primaryStrong,
      },
      danger: {
        surfaceColor: colors.surface.default,
        borderColor: colors.border.default,
        foregroundColor: colors.content.strong,
      },
    },
    mixedPromotedPanel: {
      backgroundColor: colors.surface.default,
      borderColor: colors.border.primary,
      textColor: colors.content.strong,
      linear: {
        colors: [colors.surface.primarySubtle, colors.surface.secondarySubtle],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      radial: {
        center: { x: 0.86, y: 0.14 },
        radius: 0.66,
        centerColor: colors.border.primaryStrong,
        edgeColor: "transparent",
      },
    },
    dividerColor: colors.border.default,
    focusRingColor,
  };
};
