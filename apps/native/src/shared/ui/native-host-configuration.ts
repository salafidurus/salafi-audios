import type { UniversalHostProps } from "@expo/ui";

import type { AppThemeNative } from "@/core/styles/theme";

/** Describes theme-owned values that every native Expo UI host must receive. */
/** The resolved host configuration shared by screen and bridge boundaries. */
export type NativeHostConfiguration = Pick<
  UniversalHostProps,
  "colorScheme" | "layoutDirection" | "seedColor"
>;

/** Maps the active native theme to the explicit Expo UI host boundary. */
export function getNativeHostConfiguration(
  theme: AppThemeNative,
  themeName: "system" | "light" | "dark" = "system",
): NativeHostConfiguration {
  return {
    colorScheme: themeName === "system" ? undefined : themeName,
    layoutDirection: theme.direction === "rtl" ? "rightToLeft" : "leftToRight",
    seedColor: theme.colors.action.primary,
  };
}
