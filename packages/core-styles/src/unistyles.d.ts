import "react-native-unistyles";
import type {
  lightMobileTheme,
  darkMobileTheme,
  lightWebTheme,
  darkWebTheme,
} from "@sd/design-tokens";

type AppBreakpoints = {
  xs: 0;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  superLarge: number;
  tvLike: number;
};

type AppThemes = {
  light: typeof lightMobileTheme | typeof lightWebTheme;
  dark: typeof darkMobileTheme | typeof darkWebTheme;
};

declare module "react-native-unistyles" {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}
