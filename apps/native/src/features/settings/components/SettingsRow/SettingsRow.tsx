import type { ReactNode } from "react";

import { Column, Row } from "@expo/ui";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { NativeText } from "@/shared/ui/native-text";

export interface SettingsRowProps {
  label?: string;
  sublabel?: string;
  children?: ReactNode;
  fullWidth?: boolean;
  /** Renders the control in its own full-width row below the label, for controls too wide to fit inline. */
  stacked?: boolean;
  onPress?: () => void;
  hideBorder?: boolean;
  testID?: string;
}

export function SettingsRow({
  label,
  sublabel,
  children,
  fullWidth = false,
  stacked = false,
  hideBorder = false,
  testID,
}: SettingsRowProps) {
  const { theme } = useUnistyles();

  const labelGroup = (
    <Column spacing={theme.spacing.scale.xs}>
      {label ? (
        <NativeText variant="bodyMd" colorRole="default" textStyle={styles.label}>
          {label}
        </NativeText>
      ) : null}
      {sublabel ? (
        <NativeText variant="caption" colorRole="muted">
          {sublabel}
        </NativeText>
      ) : null}
    </Column>
  );

  if (fullWidth) {
    return (
      <Row
        testID={testID}
        alignment="center"
        style={Object.assign({}, styles.row, hideBorder ? styles.noBorder : undefined)}
      >
        <Column>{children}</Column>
      </Row>
    );
  }

  if (stacked) {
    return (
      <Row
        testID={testID}
        alignment="center"
        style={Object.assign({}, styles.row, hideBorder ? styles.noBorder : undefined)}
      >
        <Column spacing={theme.spacing.scale.sm} testID="settings-row-stacked-content">
          {labelGroup}
          {children ? <Column>{children}</Column> : null}
        </Column>
      </Row>
    );
  }

  return (
    <Row
      testID={testID}
      alignment="center"
      spacing={theme.spacing.component.gapLg}
      style={Object.assign({}, styles.row, hideBorder ? styles.noBorder : undefined)}
    >
      {labelGroup}
      {children ? <Column>{children}</Column> : null}
    </Row>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    paddingVertical: theme.spacing.scale.md,
    paddingHorizontal: theme.spacing.scale.lg,
    borderBottomWidth: theme.border.width.default,
    borderBottomColor: theme.colors.border.subtle,
    minHeight: 48,
    backgroundColor: "transparent",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  label: {
    fontWeight: "500",
  },
}));
