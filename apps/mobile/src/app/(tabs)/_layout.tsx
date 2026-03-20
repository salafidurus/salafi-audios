import { AdaptiveShell } from "@sd/feature-navigation";
import { Slot } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useRef } from "react";

export default function TabLayout() {
  const containerRef = useRef<View>(null);

  return (
    <View ref={containerRef} style={styles.container}>
      <Slot />
      <AdaptiveShell blurTargetRef={containerRef} />
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
  },
}));
