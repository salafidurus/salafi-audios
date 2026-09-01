import { Pressable, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";

import { useSearchPalette } from "../SearchPalette/SearchPalette";

/**
 * Provides the global discovery action used by persistent root headers.
 */
/** Renders a labeled action that pushes Search while preserving the caller's root stack. */
export function GlobalSearchButton() {
  const { open } = useSearchPalette();
  const { t } = useTranslation();
  const label = t("search.open", "Search");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={open}
      style={styles.button}
      testID="global-search-button"
    >
      <Text style={styles.icon}>⌕</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    width: theme.spacing.scale["4xl"],
    height: theme.spacing.scale["4xl"],
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.surface.elevated,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
  },
  icon: {
    fontSize: 28,
    lineHeight: 30,
    color: theme.colors.content.strong,
  },
}));
