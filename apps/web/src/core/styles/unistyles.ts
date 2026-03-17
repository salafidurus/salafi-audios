/* eslint-disable @typescript-eslint/no-empty-object-type */
// Polyfill React Native's __DEV__ global for web builds (Turbopack doesn't use DefinePlugin)
// @ts-expect-error - RN global not typed in web context
if (typeof globalThis.__DEV__ === "undefined") {
  // @ts-expect-error - RN global not typed in web context
  globalThis.__DEV__ = process.env.NODE_ENV !== "production";
}

import { StyleSheet } from "react-native-unistyles";
import { darkWebTheme, lightWebTheme } from "@sd/design-tokens";

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

type AppBreakpoints = typeof breakpoints;

type AppThemes = {
  light: typeof lightWebTheme;
  dark: typeof darkWebTheme;
};

declare module "react-native-unistyles" {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  breakpoints,
  themes: {
    light: lightWebTheme,
    dark: darkWebTheme,
  },
  settings: {
    adaptiveThemes: true,
  },
});
