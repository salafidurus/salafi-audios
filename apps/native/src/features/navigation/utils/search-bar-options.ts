import type { AppThemeNative } from "@/core/styles/theme";

/** Provides the native features navigation utils search-bar-options module responsibility. */
/** Describes the getThemedSearchBarOptions native function contract and behavior. */
export function getThemedSearchBarOptions(theme: AppThemeNative) {
  return {
    textColor: theme.colors.content.default,
    headerIconColor: theme.colors.content.default,
    hintTextColor: theme.colors.content.muted,
    tintColor: theme.colors.action.primary,
    barTintColor: theme.colors.surface.subtle,
  };
}
