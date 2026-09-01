import { Host } from "@expo/ui";
import { routes } from "@sd/core-contracts";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { NativeIcon } from "@/shared/ui";

/**
 * Provides the global discovery action used by persistent root headers.
 */
/** Renders a labeled action that pushes Search while preserving the caller's root stack. */
export function GlobalSearchButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const label = t("search.open", "Search");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => router.push(routes.search)}
      style={styles.button}
      testID="global-search-button"
    >
      <Host>
        <NativeIcon name="search" colorRole="strong" size={22} />
      </Host>
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
}));
