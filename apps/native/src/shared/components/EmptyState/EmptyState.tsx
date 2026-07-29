import { View, type TextStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

export type EmptyStateVariant = "empty" | "loading" | "error";

export type EmptyStateProps = {
  message: string;
  variant?: EmptyStateVariant;
};

const textStyleMap: Record<EmptyStateVariant, TextStyle> = {
  empty: styles.text_empty,
  loading: styles.text_loading,
  error: styles.text_error,
};

export function EmptyState({ message, variant = "empty" }: EmptyStateProps) {
  return (
    <View style={[styles.emptyState, styles[variant]]}>
      <AppText variant="bodyMd" style={textStyleMap[variant]}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  emptyState: {
    paddingVertical: theme.spacing.scale.xl,
    paddingHorizontal: theme.spacing.scale.lg,
    alignItems: "center",
    justifyContent: "center",
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
}));
