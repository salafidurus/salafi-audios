import { AdaptiveShell } from "@sd/ui-mobile";
import { BlurTargetView } from "expo-blur";
import { Slot } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useRef } from "react";

export default function TabLayout() {
  const blurTargetRef = useRef<InstanceType<typeof View>>(null);

  return (
    <BlurTargetView ref={blurTargetRef} style={styles.container}>
      <Slot />
      <AdaptiveShell blurTargetRef={blurTargetRef} />
    </BlurTargetView>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
  },
}));
