import type { AppThemeNative } from "@/core/styles/theme";

/** Defines native tab, subroute, and accessory navigation behavior. */
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

/** Returns the the tab stack screen options used by native consumers. */
export function getTabStackScreenOptions(theme: AppThemeNative) {
  return {
    headerShown: true,
    headerTransparent: false,
    headerLargeTitle: true,
    ...getThemedHeaderColors(theme),
  };
}

/** Returns the the form sheet screen options used by native consumers. */
export function getFormSheetScreenOptions(theme: AppThemeNative) {
  return {
    headerShown: true,
    presentation: "formSheet" as const,
    headerBackVisible: true,
    headerTitle: "",
    ...getThemedHeaderColors(theme),
  };
}
