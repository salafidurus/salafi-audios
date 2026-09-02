/** Maps native semantic colors to the Expo Router search-bar contract. */
import type { AppThemeNative } from "@/core/styles/theme";

/** Returns every search-bar color from semantic theme roles for light/dark parity. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module/declaration comments are both present above.
export function getThemedSearchBarOptions(theme: AppThemeNative) {
  return {
    textColor: theme.colors.content.default,
    headerIconColor: theme.colors.content.default,
    hintTextColor: theme.colors.content.muted,
    tintColor: theme.colors.action.primary,
    barTintColor: theme.colors.surface.subtle,
  };
}
