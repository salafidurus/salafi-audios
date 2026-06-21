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
    padding: 24,
    gap: 16,
  },
  message: {
    color: theme.colors.content.muted,
    textAlign: "center",
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.action.primary,
    borderRadius: 8,
  },
  retryLabel: {
    color: theme.colors.action.primary,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
}));
