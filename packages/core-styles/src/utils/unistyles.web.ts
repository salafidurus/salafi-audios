/* eslint-disable @typescript-eslint/no-empty-object-type */
// Polyfill React Native's __DEV__ global for web builds (Turbopack doesn't use DefinePlugin)
// @ts-expect-error - RN global not typed in web context
if (typeof globalThis.__DEV__ === "undefined") {
  // @ts-expect-error - RN global not typed in web context
  globalThis.__DEV__ = process.env.NODE_ENV !== "production";
}

import { StyleSheet } from "react-native-unistyles";
import { darkWebTheme, lightWebTheme } from "@sd/design-tokens";

const webBreakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  superLarge: 2000,
  tvLike: 4000,
} as const;

StyleSheet.configure({
  // This bootstrap is imported from web entrypoints across packages.
  // Package-local Unistyles module augmentation may describe native-only themes,
  // so keep the runtime config explicit instead of coupling it to the caller's TS view.
  breakpoints: webBreakpoints as never,
  themes: {
    light: lightWebTheme as never,
    dark: darkWebTheme as never,
  },
  settings: {
    initialTheme: "light",
  },
});
