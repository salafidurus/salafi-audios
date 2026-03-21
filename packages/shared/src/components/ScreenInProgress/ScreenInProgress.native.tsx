import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ScreenViewMobileNative } from "../ScreenView/ScreenView.native";

type ScreenInProgressMobileNativeProps = {
  title?: string;
  description?: string;
};

export function ScreenInProgressMobileNative({
  title = "Coming Soon",
  description = "This feature is under development",
}: ScreenInProgressMobileNativeProps) {
  return (
    <ScreenViewMobileNative center backgroundVariant="mixedWash">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{description}</Text>
    </ScreenViewMobileNative>
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
