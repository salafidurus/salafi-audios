import type { AppThemeNative } from "@/core/styles/theme";

/** Defines native tab, subroute, and accessory navigation behavior. */
/** Returns the the themed search bar options used by native consumers. */
export function getThemedSearchBarOptions(theme: AppThemeNative) {
  return {
    textColor: theme.colors.content.default,
    headerIconColor: theme.colors.content.default,
    hintTextColor: theme.colors.content.muted,
    tintColor: theme.colors.action.primary,
    barTintColor: theme.colors.surface.subtle,
  };
}
