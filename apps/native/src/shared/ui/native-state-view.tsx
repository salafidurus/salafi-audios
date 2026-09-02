import { Column } from "@expo/ui";

import { NativeButton } from "./native-button";
import { NativeText } from "./native-text";

/** Renders common loading, empty, error, information, and success states. */

/** Identifies whether the state is informational or offers recovery. */
export type NativeStateKind = "empty" | "error" | "info" | "loading" | "success";

/** Defines recoverable state presentation without owning domain state. */
export type NativeStateViewProps = {
  /** Controls semantic presentation and the action's default variant. */
  kind: NativeStateKind;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
};

/** Presents a semantic state and optional user-recovery action. */
export function NativeStateView({
  kind,
  title,
  message,
  actionLabel,
  onAction,
  testID,
}: NativeStateViewProps) {
  return (
    <Column testID={testID}>
      <NativeText variant="titleMd" colorRole="strong">
        {title}
      </NativeText>
      {message ? <NativeText colorRole="muted">{message}</NativeText> : null}
      {actionLabel && onAction ? (
        <NativeButton
          label={actionLabel}
          onPress={onAction}
          variant={kind === "error" ? "outline" : "primary"}
        />
      ) : null}
    </Column>
  );
}
