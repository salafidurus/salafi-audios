import { Text } from "react-native-unistyles/components/native/Text";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { ScreenView } from "../ScreenView";

export function ScreenInProgress() {
  const { theme } = useUnistyles();

  return (
    <ScreenView center>
      <Text style={[styles.title, { color: theme.colors.content.strong }]}>Coming Soon</Text>
      <Text style={[styles.subtitle, { color: theme.colors.content.muted }]}>
        This feature is under development
      </Text>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 8,
  },
});
