import { Text, StyleSheet } from "react-native";
import { ScreenView } from "./ScreenView";

export function ScreenInProgress() {
  return (
    <ScreenView center>
      <Text style={styles.title}>Coming Soon</Text>
      <Text style={styles.subtitle}>This feature is under development</Text>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
  },
});
