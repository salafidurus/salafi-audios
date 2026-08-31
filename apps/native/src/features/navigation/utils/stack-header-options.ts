/** Provides themed stack-header contracts used by native route groups. */
import type { AppThemeNative } from "@/core/styles/theme";

/** Provides themed stack-header contracts used by native route groups. */
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

/** Builds the consistent, opaque header contract used by root tab stacks. */
export function getTabStackScreenOptions(theme: AppThemeNative) {
  return {
    headerShown: true,
    headerTransparent: false,
    headerLargeTitle: true,
    ...getThemedHeaderColors(theme),
  };
}

/** Builds form-sheet options while reusing the app surface and tint tokens. */
export function getFormSheetScreenOptions(theme: AppThemeNative) {
  return {
    headerShown: true,
    presentation: "formSheet" as const,
    headerBackVisible: true,
    headerTitle: "",
    ...getThemedHeaderColors(theme),
  };
}
