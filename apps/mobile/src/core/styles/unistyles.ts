import { StyleSheet } from "react-native-unistyles";

import { lightMobileTheme, darkMobileTheme } from "@sd/design-tokens";

const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  superLarge: 2000,
  tvLike: 4000,
} as const;

type AppBreakpoints = typeof breakpoints;

declare module "react-native-unistyles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes {
    light: typeof lightMobileTheme;
    dark: typeof darkMobileTheme;
  }
}

StyleSheet.configure({
  breakpoints,
  themes: {
    light: lightMobileTheme,
    dark: darkMobileTheme,
  },
  settings: {
    adaptiveThemes: true,
  },
});
