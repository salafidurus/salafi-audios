/** Owns the platform accessory host while preserving RN fallback positioning. */
import { RNHostView } from "@expo/ui";
import { ExpoBottomAccessoryView } from "expo-bottom-accessory";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { BottomAccessoryContent } from "./BottomAccessoryContent";

/** Hosts children in the compiled Android accessory module, falling back when unavailable. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module/declaration comments are both present above.
export function BottomAccessoryParent({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  if (Platform.OS === "android") {
    try {
      return (
        <ExpoBottomAccessoryView
          offsetPadding={0}
          animationEnabled={true}
          elevation={8}
          style={styles.androidParent}
        >
          {children}
        </ExpoBottomAccessoryView>
      );
    } catch {
      // Fallback if native module not compiled into current binary
    }
  }

  const bottomOffset = 56 + Math.max(insets.bottom, theme.spacing.scale.sm);

  return (
    <RNHostView
      // SAFETY: RNHostView forwards these RN fallback props at the explicit bridge boundary.
      {
        /* SAFETY: explicit RN fallback bridge props */ ...({ pointerEvents: "box-none" } as any)
      }
      style={
        /* SAFETY: explicit RN fallback bridge style */ [
          styles.fallbackParent,
          { bottom: bottomOffset },
        ] as any
      }
    >
      {children}
    </RNHostView>
  );
}

/** Mounts the accessory only on Android, where the platform module is supported. */
export function BottomAccessory() {
  if (Platform.OS === "ios") {
    return null;
  }

  return (
    <BottomAccessoryParent>
      <BottomAccessoryContent />
    </BottomAccessoryParent>
  );
}

const styles = StyleSheet.create(() => ({
  androidParent: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  fallbackParent: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 99,
  },
}));
