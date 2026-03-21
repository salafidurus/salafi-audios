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

export type AccentRecipesShared = {
  primaryCta: AccentPrimaryCtaRecipe;
  primarySubtleSurface: AccentSurfaceRecipe;
  secondarySubtleSurface: AccentSurfaceRecipe;
  mixedHeroSurface: AccentSurfaceRecipe;
  dividerColor: string;
  focusRingColor: string;
};
