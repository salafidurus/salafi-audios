import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Text } from "react-native-unistyles/components/native/Text";
import type { lightMobileTheme } from "@sd/design-tokens";
import { ScreenViewWeb } from "../ScreenView/ScreenView";

type SharedTheme = typeof lightMobileTheme;

export function ScreenInProgressMobileWeb() {
  const { theme } = useUnistyles() as unknown as { theme: SharedTheme };

  return (
    <ScreenViewWeb center backgroundVariant="mixedWash">
      <Text style={[styles.title, { color: theme.colors.content.primary }]}>Coming Soon</Text>
      <Text style={[styles.subtitle, { color: theme.colors.content.default }]}>
        This feature is under development
      </Text>
    </ScreenViewWeb>
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
