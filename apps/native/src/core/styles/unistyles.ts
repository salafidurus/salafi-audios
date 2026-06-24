import { StyleSheet as RNStyleSheet } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { darkNativeTheme as baseDark, lightNativeTheme as baseLight } from "@sd/design-tokens";

const patchTheme = <T extends typeof baseLight>(theme: T) => ({
  ...theme,
  border: {
    ...theme.border,
    width: {
      ...theme.border.width,
      hairline: RNStyleSheet.hairlineWidth,
    },
  },
});

const lightNativeTheme = patchTheme(baseLight);
const darkNativeTheme = patchTheme(baseDark);

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
  export interface UnistylesBreakpoints extends NativeBreakpoints {}
  export interface UnistylesThemes {
    light: typeof lightNativeTheme;
    dark: typeof darkNativeTheme;
  }
}

StyleSheet.configure({
  breakpoints,
  themes: {
    light: lightNativeTheme,
    dark: darkNativeTheme,
  },
  settings: {
    adaptiveThemes: true,
  },
});
