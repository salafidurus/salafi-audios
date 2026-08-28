import { Pressable, View, type TextStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

/** Renders the native empty state variant surface and coordinates its user-facing state. */
/** Defines the native empty state variant contract shared by its consumers. */
export type EmptyStateVariant = "empty" | "loading" | "error";

/** Describes the inputs and callbacks accepted by Empty State. */
export type EmptyStateProps = {
  message: string;
  variant?: EmptyStateVariant;
  onRetry?: () => void;
  retryLabel?: string;
};

/** Enumerates the lifecycle values used by the native empty workflow. */
export function EmptyState({
  message,
  variant = "empty",
  onRetry,
  retryLabel = "Try Again",
}: EmptyStateProps) {
  return (
    <View style={[styles.emptyState, styles[variant]]}>
      <AppText variant="bodyMd" style={TEXT_STYLE_BY_VARIANT[variant]}>
        {message}
      </AppText>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <AppText variant="labelMd" style={styles.retryLabel}>
            {retryLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  emptyState: {
    paddingVertical: theme.spacing.scale.xl,
    paddingHorizontal: theme.spacing.scale.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.scale.md,
  },
  empty: {
    backgroundColor: theme.colors.surface.default,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.card,
  },
  loading: {},
  error: {
    backgroundColor: theme.colors.state.dangerSurface,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.state.dangerBorder,
    borderRadius: theme.radius.component.card,
  },
  text_empty: {
    color: theme.colors.content.muted,
    textAlign: "center",
  },
  text_loading: {
    color: theme.colors.content.subtle,
    textAlign: "center",
  },
  text_error: {
    color: theme.colors.state.dangerContent,
    textAlign: "center",
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
}));

const TEXT_STYLE_BY_VARIANT = {
  empty: styles.text_empty,
  loading: styles.text_loading,
  error: styles.text_error,
} satisfies Record<EmptyStateVariant, TextStyle>;
