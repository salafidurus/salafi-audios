/** Cross-platform composite recipes for gradients, surfaces, badges, and application chrome. */
/** Shared linear-gradient geometry and colors for accent surfaces. */
export type AccentLinearRecipe = {
  colors: [string, string];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

/** Shared radial-gradient geometry and colors for accent surfaces. */
export type AccentRadialRecipe = {
  center: { x: number; y: number };
  radius: number;
  centerColor: string;
  edgeColor: string;
};

/** Composite recipe for the primary call-to-action treatment. */
export type AccentPrimaryCtaRecipe = {
  backgroundColor: string;
  borderColor: string;
  borderColorHover: string;
  textColor: string;
  shadowColor: string;
  shadowColorPressed: string;
  linear: AccentLinearRecipe;
  radial: AccentRadialRecipe;
};

/** Composite recipe for an accented surface and its readable content. */
export type AccentSurfaceRecipe = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  linear: AccentLinearRecipe;
  radial: AccentRadialRecipe;
};

/** Layered accent colors used to wash a screen background. */
export type ScreenWashRecipe = {
  washPrimary: string;
  washSecondary: string;
  washMixed: string;
};

/** Shared shell and input chrome colors for application framing. */
export type ChromeRecipe = {
  surface: string;
  surfaceStrong: string;
  border: string;
  borderStrong: string;
  hoverAccentSurface: string;
  inputBorderRest: string;
};

/** Selected-surface colors that pair background and foreground semantics. */
export type AccentSelectedSurfaceRecipe = {
  backgroundColor: string;
  contentColor: string;
};

/** Surface, border, and foreground colors for a semantic badge. */
export type AccentBadgeRecipe = {
  surfaceColor: string;
  borderColor: string;
  foregroundColor: string;
};

/** Badge recipes grouped by semantic status variant. */
export type BadgeVariantRecipes = {
  primary: AccentBadgeRecipe;
  secondary: AccentBadgeRecipe;
  success: AccentBadgeRecipe;
  danger: AccentBadgeRecipe;
};

/** Complete cross-platform recipe contract for composed accent treatments. */
export type AccentRecipesShared = {
  primaryCta: AccentPrimaryCtaRecipe;
  primarySubtleSurface: AccentSurfaceRecipe;
  secondarySubtleSurface: AccentSurfaceRecipe;
  mixedHeroSurface: AccentSurfaceRecipe;
  selectedSurface: AccentSelectedSurfaceRecipe;
  selectedContent: string;
  secondarySupportingBadge: AccentBadgeRecipe;
  badge: BadgeVariantRecipes;
  mixedPromotedPanel: AccentSurfaceRecipe;
  dividerColor: string;
  focusRingColor: string;
};
