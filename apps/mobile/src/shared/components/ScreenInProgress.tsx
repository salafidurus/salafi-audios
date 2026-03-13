import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ScreenView } from "./ScreenView";

export function ScreenInProgress() {
  return (
    <ScreenView center>
      <Text style={styles.title}>Coming Soon</Text>
      <Text style={styles.subtitle}>This feature is under development</Text>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  title: {
    fontFamily: theme.typography.titleLg.fontFamily,
    fontSize: theme.typography.titleLg.fontSize,
    lineHeight: theme.typography.titleLg.lineHeight,
    letterSpacing: theme.typography.titleLg.letterSpacing,
    color: theme.colors.content.strong,
  },
  subtitle: {
    fontFamily: theme.typography.bodySm.fontFamily,
    fontSize: theme.typography.bodySm.fontSize,
    lineHeight: theme.typography.bodySm.lineHeight,
    letterSpacing: theme.typography.bodySm.letterSpacing,
    color: theme.colors.content.muted,
  },
}));
