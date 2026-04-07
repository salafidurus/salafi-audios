export { lightWebTheme, darkWebTheme } from "./theme/web";
// Keep the mobile themes available from the default entry as well.
// Some workspace package builds resolve @sd/design-tokens through the default
// export path even when compiling native-only sources.
export { lightMobileTheme, darkMobileTheme } from "./theme/native";
export type { TypographyVariant } from "./typography/shared";
