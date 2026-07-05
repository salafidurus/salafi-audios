import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export type FeedStatusViewProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function FeedStatusView({ message, onRetry, retryLabel }: FeedStatusViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryLabel}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Footer spinner shown while fetching additional feed pages. */
export function FeedLoadingFooter() {
  const { theme } = useUnistyles();
  return (
    <View style={styles.footer}>
      <ActivityIndicator color={theme.colors.content.muted} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.scale["2xl"],
    gap: theme.spacing.scale.lg,
  },
  message: {
    color: theme.colors.content.muted,
    textAlign: "center",
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.scale.xl,
    paddingVertical: theme.spacing.scale.sm,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.action.primary,
    borderRadius: theme.radius.scale.sm,
  },
  retryLabel: {
    color: theme.colors.action.primary,
    fontWeight: "600",
  },
  footer: {
    padding: theme.spacing.scale.lg,
    alignItems: "center",
  },
}));
