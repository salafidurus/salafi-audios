import { StyleSheet } from "react-native-unistyles";

import { lightNativeTheme, darkNativeTheme } from "./theme";

/** Configures native themes, breakpoints, and the Unistyles runtime. */
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  superLarge: 2000,
  tvLike: 4000,
} as const;

type NativeBreakpoints = typeof breakpoints;

declare module "react-native-unistyles" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  /** Defines the native shape consumed by unistyles breakpoints integrations. */
  export interface UnistylesBreakpoints extends NativeBreakpoints {}
  /** Defines the native shape consumed by unistyles themes integrations. */
  export interface UnistylesThemes {
    system: typeof lightNativeTheme;
    light: typeof lightNativeTheme;
    dark: typeof darkNativeTheme;
  }
}

StyleSheet.configure({
  breakpoints,
  themes: {
    system: lightNativeTheme,
    light: lightNativeTheme,
    dark: darkNativeTheme,
  },
  settings: {
    initialTheme: "system",
    adaptiveThemes: false,
  },
});
