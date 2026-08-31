import { Music } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";

/** Adapts the platform audio engine to the native playback contract and lifecycle. */
/** Describes the inputs, callbacks, and optional state accepted by Mini Player Icon Button. */
export type MiniPlayerIconButtonProps = {
  onPress: () => void;
};

/** Renders the native mini player icon button surface and coordinates its user-facing state. */
export function MiniPlayerIconButton({ onPress }: MiniPlayerIconButtonProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityRole="button"
      accessibilityLabel={t("navigation.show_miniplayer", "Show mini player")}
      style={styles.container}
    >
      <EaseView animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, stiffness: 150 }}>
        <Pressable onPress={onPress} testID="mini-player-icon-button" style={styles.button}>
          <Music size={20} color={theme.colors.action.primary} />
        </Pressable>
      </EaseView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.surface.default,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    ...theme.shadows.sm,
  },
}));
