import type { UniversalHostProps } from "@expo/ui";

import type { AppThemeNative } from "@/core/styles/theme";

export type NativeHostConfiguration = Pick<
  UniversalHostProps,
  "colorScheme" | "layoutDirection" | "seedColor"
>;

export function getNativeHostConfiguration(theme: AppThemeNative): NativeHostConfiguration {
  return {
    colorScheme: theme.mode,
    layoutDirection: theme.direction === "rtl" ? "rightToLeft" : "leftToRight",
    seedColor: theme.colors.action.primary,
  };
}
