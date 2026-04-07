export type AccentLinearRecipe = {
  colors: [string, string];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export type AccentRadialRecipe = {
  center: { x: number; y: number };
  radius: number;
  centerColor: string;
  edgeColor: string;
};

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

export type AccentSurfaceRecipe = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  linear: AccentLinearRecipe;
  radial: AccentRadialRecipe;
};

export type ScreenWashRecipe = {
  washPrimary: string;
  washSecondary: string;
  washMixed: string;
};

export type ChromeRecipe = {
  surface: string;
  surfaceStrong: string;
  border: string;
  borderStrong: string;
  hoverAccentSurface: string;
  inputBorderRest: string;
};

export type AccentSelectedSurfaceRecipe = {
  backgroundColor: string;
  contentColor: string;
};

export type AccentBadgeRecipe = {
  surfaceColor: string;
  borderColor: string;
  foregroundColor: string;
};

export type AccentRecipesShared = {
  primaryCta: AccentPrimaryCtaRecipe;
  primarySubtleSurface: AccentSurfaceRecipe;
  secondarySubtleSurface: AccentSurfaceRecipe;
  mixedHeroSurface: AccentSurfaceRecipe;
  selectedSurface: AccentSelectedSurfaceRecipe;
  selectedContent: string;
  secondarySupportingBadge: AccentBadgeRecipe;
  mixedPromotedPanel: AccentSurfaceRecipe;
  dividerColor: string;
  focusRingColor: string;
};
