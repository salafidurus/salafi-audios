import { Column } from "@expo/ui";
import { useUnistyles } from "react-native-unistyles";

import type { NativeIconName } from "./native-icon-sources";

import { NativeButton } from "./native-button";
import { NativeIcon } from "./native-icon";
import { NativeText } from "./native-text";

export type NativeStateKind = "empty" | "error" | "info" | "loading" | "success";

export type NativeStateViewProps = {
  kind: NativeStateKind;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
};

export function NativeStateView({
  kind,
  title,
  message,
  actionLabel,
  onAction,
  testID,
}: NativeStateViewProps) {
  const { theme } = useUnistyles();
  const icon = getStateIcon(kind);

  return (
    <Column
      alignment="center"
      spacing={theme.spacing.component.gapMd}
      testID={testID}
      style={{
        padding: theme.spacing.scale["2xl"],
        borderRadius: theme.radius.component.card,
        backgroundColor: theme.colors.surface.subtle,
      }}
    >
      <NativeIcon
        name={icon}
        colorRole={kind === "error" ? "danger" : kind === "success" ? "success" : "primary"}
        size={theme.spacing.scale["3xl"]}
      />
      <NativeText variant="titleMd" colorRole="strong" textStyle={{ textAlign: "center" }}>
        {title}
      </NativeText>
      {message ? (
        <NativeText variant="bodyMd" colorRole="muted" textStyle={{ textAlign: "center" }}>
          {message}
        </NativeText>
      ) : null}
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

function getStateIcon(kind: NativeStateKind): NativeIconName {
  switch (kind) {
    case "error":
      return "error";
    case "success":
      return "success";
    case "loading":
      return "more";
    case "empty":
      return "search";
    case "info":
      return "settings";
  }
}
