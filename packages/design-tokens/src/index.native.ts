export { sharedColors, createColors, type SharedColors, type AppColors } from "./colors/shared";

export { spacingMobile, type SpacingMobile } from "./spacing/native";
export { radiusMobile, type RadiusMobile } from "./radius/native";

export {
  fontWeight,
  typographyBase,
  weightToKey,
  type TypographyVariant,
} from "./typography/shared";
export {
  createTypographyMobile,
  typographyMobile,
  type TypographyMobile,
} from "./typography/native";

export { shadowsShared, type ShadowsShared } from "./shadows/shared";
export {
  shadowsMobile,
  createShadowsMobile,
  type ShadowsMobile,
  type ShadowsMobileTheme,
  type ShadowsMobileVariant,
} from "./shadows/native";

export {
  createThemeMobile,
  lightMobileTheme,
  darkMobileTheme,
  type AppThemeMobile,
} from "./theme/native";
