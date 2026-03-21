import type { AppColors } from "../colors/shared";
import type { AccentRecipesShared } from "./shared";

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
};

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
): AccentRecipesWeb => {
  const primaryCta = {
    backgroundColor: colors.action.primary,
    borderColor: colors.border.primaryStrong,
    borderColorHover: colors.action.primaryHover,
    textColor: colors.content.onPrimary,
    shadowColor: colors.border.primaryStrong,
    shadowColorPressed: colors.action.primaryActive,
    linear: {
      colors: [colors.action.primary, colors.action.primaryHover] as [string, string],
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
      colors: [
        `color-mix(in srgb, ${colors.surface.primarySubtle} 96%, ${colors.surface.default})`,
        colors.surface.default,
      ] as [string, string],
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
      colors: [
        `color-mix(in srgb, ${colors.surface.secondarySubtle} 96%, ${colors.surface.default})`,
        colors.surface.default,
      ] as [string, string],
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
      colors: [
        `color-mix(in srgb, ${colors.surface.primarySubtle} 78%, ${colors.surface.default})`,
        `color-mix(in srgb, ${colors.surface.secondarySubtle} 58%, ${colors.surface.default})`,
      ] as [string, string],
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
    dividerColor: `color-mix(in srgb, ${colors.border.default} 82%, transparent)`,
    focusRingColor,
  };
};
