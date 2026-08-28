import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ScreenView } from "../ScreenView/ScreenView";

/** Provides the native shared components ScreenInProgress ScreenInProgress module responsibility. */
type ScreenInProgressProps = {
  title?: string;
  description?: string;
};

/** Describes the ScreenInProgress native function contract and behavior. */
export function ScreenInProgress({
  title = "Coming Soon",
  description = "This feature is under development",
}: ScreenInProgressProps) {
  return (
    <ScreenView center>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{description}</Text>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  title: {
    fontFamily: theme.typography.titleLg.fontFamily,
    fontSize: theme.typography.titleLg.fontSize,
    lineHeight: theme.typography.titleLg.lineHeight,
    letterSpacing: theme.typography.titleLg.letterSpacing,
    color: theme.colors.content.primary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: theme.typography.bodySm.fontFamily,
    fontSize: theme.typography.bodySm.fontSize,
    lineHeight: theme.typography.bodySm.lineHeight,
    letterSpacing: theme.typography.bodySm.letterSpacing,
    color: theme.colors.content.default,
    textAlign: "center",
    marginTop: theme.spacing.component.gapSm,
  },
}));
