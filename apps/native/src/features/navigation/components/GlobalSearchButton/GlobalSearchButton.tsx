import { Pressable, StyleSheet, Text } from "react-native";
import { useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";

import { useSearchPaletteStore } from "../SearchPalette/search-palette.store";

/**
 * Provides the global discovery action used by persistent root headers.
 */
/** Renders a labeled action that pushes Search while preserving the caller's root stack. */
export function GlobalSearchButton() {
  const open = useSearchPaletteStore((state) => state.open);
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const label = t("search.open", "Search");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={open}
      style={[
        styles.button,
        {
          width: theme.spacing.scale["4xl"],
          height: theme.spacing.scale["4xl"],
          borderRadius: theme.radius.scale.full,
          backgroundColor: theme.colors.surface.elevated,
          borderColor: theme.colors.border.subtle,
        },
      ]}
      testID="global-search-button"
    >
      <Text style={[styles.icon, { color: theme.colors.content.strong }]}>⌕</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  icon: {
    fontSize: 28,
    lineHeight: 30,
  },
});
