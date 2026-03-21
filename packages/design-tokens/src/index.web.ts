export { sharedColors, createColors, type SharedColors, type AppColors } from "./colors/shared";

export { spacingWeb, type SpacingWeb } from "./spacing/web";
export { radiusWeb, type RadiusWeb } from "./radius/web";
export { createAccentRecipesWeb, type AccentRecipesWeb } from "./recipes/web";
export type {
  AccentLinearRecipe,
  AccentPrimaryCtaRecipe,
  AccentRadialRecipe,
  AccentRecipesShared,
  AccentSurfaceRecipe,
} from "./recipes/shared";

export {
  fontWeight,
  typographyBase,
  weightToKey,
  type TypographyVariant,
} from "./typography/shared";
export { createTypographyWeb, typographyWeb, type TypographyWeb } from "./typography/web";

export { shadowsShared, type ShadowsShared } from "./shadows/shared";
export { shadowsWeb, createShadowsWeb, type ShadowsWeb, type ShadowsWebTheme } from "./shadows/web";

export { createThemeWeb, lightWebTheme, darkWebTheme, type AppThemeWeb } from "./theme/web";
