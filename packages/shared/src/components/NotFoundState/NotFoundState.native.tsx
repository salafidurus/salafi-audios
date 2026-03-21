import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { ButtonMobileNative } from "../Button/Button.native";
import { ScreenViewMobileNative } from "../ScreenView/ScreenView.native";

export type NotFoundStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onPress: () => void;
};

export function NotFoundStateMobileNative({
  title = "Page not found",
  description = "The desired screen doesn't exist or may have moved.",
  actionLabel = "Return to home screen",
  onPress,
}: NotFoundStateProps) {
  return (
    <ScreenViewMobileNative center contentStyle={styles.content}>
      <View style={styles.group}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>
      </View>
      <View style={styles.group}>
        <ButtonMobileNative
          variant="primary"
          size="md"
          label={actionLabel}
          onPress={onPress}
          style={styles.button}
        />
      </View>
    </ScreenViewMobileNative>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.component.gapXl,
  },
  group: {
    alignItems: "center",
    gap: theme.spacing.component.gapSm,
  },
  title: {
    ...theme.typography.displayMd,
    color: theme.colors.content.strong,
    textAlign: "center",
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.content.muted,
    textAlign: "center",
  },
  button: {
    alignSelf: "center",
  },
}));
