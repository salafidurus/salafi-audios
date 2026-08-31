import { Button, Host } from "@expo/ui";
import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { toUniversalStyleFromRN } from "@/core/styles/expo-ui";
import { NativeIcon } from "@/shared/ui";

/** Adapts the platform audio engine to the native playback contract and lifecycle. */
/** Describes the inputs, callbacks, and optional state accepted by Mini Player Icon Button. */
export type MiniPlayerIconButtonProps = {
  onPress: () => void;
};

/** Renders the native mini-player reveal action with an accessible label. */
export function MiniPlayerIconButton({ onPress }: MiniPlayerIconButtonProps) {
  return (
    <View style={styles.container}>
      <Host>
        <Button
          onPress={onPress}
          variant="text"
          testID="mini-player-icon-button"
          style={toUniversalStyleFromRN(styles.button)}
        >
          <NativeIcon name="music" colorRole="primary" size={20} />
        </Button>
      </Host>
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
