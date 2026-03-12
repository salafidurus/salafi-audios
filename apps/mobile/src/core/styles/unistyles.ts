/* eslint-disable @typescript-eslint/no-empty-object-type */
import { StyleSheet } from "react-native-unistyles";

import { breakpoints } from "./breakpoints";
import { lightMobileTheme, darkMobileTheme } from "@sd/design-tokens";

type AppBreakpoints = typeof breakpoints;

type AppThemes = {
  light: typeof lightMobileTheme;
  dark: typeof darkMobileTheme;
};

declare module "react-native-unistyles" {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
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
