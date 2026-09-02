import { ActivityIndicator, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { EmptyState } from "@/shared/components/EmptyState/EmptyState";

/** Composes native explore and catalog surfaces for browsing available content. */
/** Describes the inputs, callbacks, and optional state accepted by Explore Status View. */
export type ExploreStatusViewProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

/** Renders the native explore status view surface and coordinates its user-facing state. */
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
