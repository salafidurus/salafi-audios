/* eslint-disable @typescript-eslint/no-empty-object-type */
import { StyleSheet } from "react-native-unistyles";

import { breakpoints } from "./breakpoints";
import { lightMobileTheme, darkMobileTheme } from "@sd/design-tokens";

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
