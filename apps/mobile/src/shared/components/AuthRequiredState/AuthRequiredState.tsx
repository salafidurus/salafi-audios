import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "../Button/Button";
import { ScreenView } from "../ScreenView/ScreenView";

export type AuthRequiredStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onPress: () => void;
};

export function AuthRequiredState({
  title,
  description,
  actionLabel = "Sign In",
  onPress,
}: AuthRequiredStateProps) {
  return (
    <ScreenView center contentStyle={styles.content}>
      <View style={styles.group}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>
      </View>
      <View style={styles.group}>
        <Button variant="primary" size="md" label={actionLabel} onPress={onPress} />
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
    ...theme.typography.titleLg,
    color: theme.colors.content.strong,
    textAlign: "center",
  },
  subtitle: {
    ...theme.typography.bodyMd,
    color: theme.colors.content.muted,
    textAlign: "center",
  },
}));
