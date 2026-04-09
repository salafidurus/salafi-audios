import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "../Button/Button";
import { ScreenView } from "../ScreenView/ScreenView";

export type NotFoundStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onPress: () => void;
};

export function NotFoundState({
  title = "Page not found",
  description = "The desired screen doesn't exist or may have moved.",
  actionLabel = "Return to home screen",
  onPress,
}: NotFoundStateProps) {
  return (
    <ScreenView center contentStyle={styles.content}>
      <View style={styles.group}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>
      </View>
      <View style={styles.group}>
        <Button
          variant="primary"
          size="md"
          label={actionLabel}
          onPress={onPress}
          style={styles.button}
        />
      </View>
    </ScreenView>
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
