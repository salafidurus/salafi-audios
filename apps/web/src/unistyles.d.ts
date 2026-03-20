import "react-native-unistyles";
import type { lightWebTheme, darkWebTheme } from "@sd/design-tokens";

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
  light: typeof lightWebTheme;
  dark: typeof darkWebTheme;
};

declare module "react-native-unistyles" {
  // Required module augmentation shape for react-native-unistyles.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}
