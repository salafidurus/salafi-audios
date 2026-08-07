import type { ReactNode } from "react";

import { Pressable, View, type TextStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

export type EmptyStateVariant = "empty" | "loading" | "error";

export type EmptyStateProps = {
  message?: string;
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onRetry?: () => void;
  retryLabel?: string;
};

function getTextStyleMap(): Record<EmptyStateVariant, TextStyle> {
  return {
    empty: styles.title_empty,
    loading: styles.title_loading,
    error: styles.title_error,
  };
}

function getDescriptionStyleMap(): Record<EmptyStateVariant, TextStyle> {
  return {
    empty: styles.description_empty,
    loading: styles.description_loading,
    error: styles.description_error,
  };
}

export function EmptyState({
  message,
  variant = "empty",
  title,
  description,
  icon,
  actionLabel,
  onAction,
  onRetry,
  retryLabel = "Try Again",
}: EmptyStateProps) {
  const headline = title ?? message ?? "";
  const showAction = Boolean(onAction || onRetry);

  return (
    <View style={[styles.emptyState, styles[variant]]}>
      {icon ? <View style={styles.iconCircle}>{icon}</View> : null}

      <AppText variant="displayMd" style={[getTextStyleMap()[variant], styles.title]}>
        {headline}
      </AppText>

      {description ? (
        <AppText variant="bodySm" style={[getDescriptionStyleMap()[variant], styles.description]}>
          {description}
        </AppText>
      ) : null}

      {showAction ? (
        <Pressable
          onPress={onAction ?? onRetry}
          style={styles.actionButton}
          accessibilityRole="button"
        >
          <AppText variant="labelMd" style={styles.actionLabel}>
            {actionLabel ?? retryLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  emptyState: {
    paddingVertical: theme.spacing.scale["2xl"],
    paddingHorizontal: theme.spacing.scale.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.scale.md,
  },
  empty: {},
  loading: {},
  error: {
    backgroundColor: theme.colors.state.dangerSurface,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.state.dangerBorder,
    borderRadius: theme.radius.component.card,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  title_empty: {
    color: theme.colors.content.strong,
  },
  title_loading: {
    color: theme.colors.content.subtle,
  },
  title_error: {
    color: theme.colors.state.dangerContent,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  description_empty: {
    color: theme.colors.content.muted,
  },
  description_loading: {
    color: theme.colors.content.subtle,
  },
  description_error: {
    color: theme.colors.state.dangerContent,
  },
  actionButton: {
    marginTop: theme.spacing.scale.xs,
    paddingHorizontal: theme.spacing.scale.xl,
    paddingVertical: theme.spacing.scale.sm,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.action.primary,
  },
  actionLabel: {
    color: theme.colors.content.onPrimary,
    fontWeight: "600",
  },
}));
