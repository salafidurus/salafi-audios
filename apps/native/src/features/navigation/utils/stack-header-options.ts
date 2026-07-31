import type { AppThemeNative } from "@/core/styles/theme";

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

export function getTabStackScreenOptions(theme: AppThemeNative) {
  return {
    headerShown: true,
    headerTransparent: false,
    headerLargeTitle: true,
    ...getThemedHeaderColors(theme),
  };
}

export function getFormSheetScreenOptions(theme: AppThemeNative) {
  return {
    headerShown: true,
    presentation: "formSheet" as const,
    headerBackVisible: true,
    headerTitle: "",
    ...getThemedHeaderColors(theme),
  };
}
