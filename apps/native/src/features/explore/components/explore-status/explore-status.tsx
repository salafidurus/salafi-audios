import { ActivityIndicator, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { EmptyState } from "@/shared/components/EmptyState/EmptyState";

/** Provides the native features explore components explore-status explore-status module responsibility. */
/** Describes the ExploreStatusViewProps native type contract and behavior. */
export type ExploreStatusViewProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

/** Describes the ExploreStatusView native function contract and behavior. */
export function ExploreStatusView({ message, onRetry, retryLabel }: ExploreStatusViewProps) {
  return (
    <View style={styles.container}>
      <EmptyState
        message={message}
        variant={onRetry ? "error" : "empty"}
        onRetry={onRetry}
        retryLabel={retryLabel}
      />
    </View>
  );
}

/** Footer spinner shown while fetching additional explore pages. */
export function ExploreLoadingFooter() {
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
