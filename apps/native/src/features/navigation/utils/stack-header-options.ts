import type { AppThemeNative } from "@/core/styles/theme";

/** Provides the native features navigation utils stack-header-options module responsibility. */
function getThemedHeaderColors(theme: AppThemeNative) {
  return {
    headerStyle: { backgroundColor: theme.colors.surface.default },
    headerTintColor: theme.colors.content.strong,
    headerShadowVisible: false,
    contentStyle: {
      backgroundColor: theme.colors.surface.canvas,
    },
  };
}

/** Describes the getTabStackScreenOptions native function contract and behavior. */
export function getTabStackScreenOptions(theme: AppThemeNative) {
  return {
    headerShown: true,
    headerTransparent: false,
    headerLargeTitle: true,
    ...getThemedHeaderColors(theme),
  };
}

/** Describes the getFormSheetScreenOptions native function contract and behavior. */
export function getFormSheetScreenOptions(theme: AppThemeNative) {
  return {
    headerShown: true,
    presentation: "formSheet" as const,
    headerBackVisible: true,
    headerTitle: "",
    ...getThemedHeaderColors(theme),
  };
}
