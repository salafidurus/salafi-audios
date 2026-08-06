import { ExpoBottomAccessoryView } from "expo-bottom-accessory";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { BottomAccessoryContent } from "./BottomAccessoryContent";

/** Height of the Android NativeTabs bottom bar (Material 3 bottom navigation with labels). */
const ANDROID_TAB_BAR_HEIGHT = 80;

export function BottomAccessoryParent({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  if (Platform.OS === "android") {
    try {
      return (
        <ExpoBottomAccessoryView
          offsetPadding={theme.spacing.scale.xs}
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

  // JS fallback: clear the Android tab bar (taller than the iOS 56pt bar) plus the
  // bottom safe-area inset so the accessory never overlaps the tab bar or content.
  const bottomOffset = ANDROID_TAB_BAR_HEIGHT + Math.max(insets.bottom, theme.spacing.scale.sm);

  return (
    <View pointerEvents="box-none" style={[styles.fallbackParent, { bottom: bottomOffset }]}>
      {children}
    </View>
  );
}

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
