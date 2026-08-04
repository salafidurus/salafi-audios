import { Column } from "@expo/ui";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { NativeButton } from "@/shared/ui/native-button";
import { NativeText } from "@/shared/ui/native-text";

export type EmptyStateVariant = "empty" | "loading" | "error";

export type EmptyStateProps = {
  message: string;
  variant?: EmptyStateVariant;
  onRetry?: () => void;
  retryLabel?: string;
  testID?: string;
};

export function EmptyState({
  message,
  variant = "empty",
  onRetry,
  retryLabel = "Try Again",
  testID,
}: EmptyStateProps) {
  const { theme } = useUnistyles();
  const colorRole = variant === "error" ? "danger" : variant === "loading" ? "muted" : "subtle";

  return (
    <Column
      testID={testID}
      alignment="center"
      spacing={theme.spacing.component.gapMd}
      style={Object.assign({}, styles.container, getVariantStyle(variant, theme))}
    >
      <NativeText variant="bodyMd" colorRole={colorRole}>
        {message}
      </NativeText>
      {onRetry ? (
        <NativeButton label={retryLabel} variant="outline" size="sm" onPress={onRetry} />
      ) : null}
    </Column>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingVertical: theme.spacing.scale.xl,
    paddingHorizontal: theme.spacing.scale.lg,
  },
}));

type Theme = ReturnType<typeof useUnistyles>["theme"];

function getVariantStyle(variant: EmptyStateVariant, theme: Theme) {
  switch (variant) {
    case "empty":
      return {
        backgroundColor: theme.colors.surface.default,
        borderWidth: theme.border.width.default,
        borderColor: theme.colors.border.subtle,
        borderRadius: theme.radius.component.card,
      };
    case "error":
      return {
        backgroundColor: theme.colors.state.dangerSurface,
        borderWidth: theme.border.width.default,
        borderColor: theme.colors.state.dangerBorder,
        borderRadius: theme.radius.component.card,
      };
    case "loading":
    default:
      return undefined;
  }
}
