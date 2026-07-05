// Shared platform-agnostic tokens — consumed by both apps/native and apps/web
export { createColors } from "./colors/shared";
export type { AppColors } from "./colors/shared";

export { typographyBase, getWeightKey } from "./typography/shared";
export type { TypographyVariant } from "./typography/shared";

export type {
  AccentLinearRecipe,
  AccentRadialRecipe,
  AccentPrimaryCtaRecipe,
  AccentSurfaceRecipe,
  AccentSelectedSurfaceRecipe,
  AccentBadgeRecipe,
  BadgeVariantRecipes,
  AccentRecipesShared,
  ScreenWashRecipe,
  ChromeRecipe,
} from "./recipes/shared";
