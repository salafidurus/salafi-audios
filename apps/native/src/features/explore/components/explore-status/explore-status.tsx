import { Column } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { NativeProgress } from "@/shared/ui";

export type ExploreStatusViewProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ExploreStatusView({ message, onRetry, retryLabel }: ExploreStatusViewProps) {
  const { theme } = useUnistyles();

  return (
    <Column
      alignment="center"
      spacing={theme.spacing.scale.lg}
      style={{ padding: theme.spacing.scale["2xl"] }}
    >
      <EmptyState
        message={message}
        variant={onRetry ? "error" : "empty"}
        onRetry={onRetry}
        retryLabel={retryLabel}
      />
    </Column>
  );
}

/** Footer spinner shown while fetching additional explore pages. */
export function ExploreLoadingFooter() {
  const { theme } = useUnistyles();
  return (
    <Column alignment="center" style={{ padding: theme.spacing.scale.lg }}>
      <NativeProgress variant="circular" />
    </Column>
  );
}
