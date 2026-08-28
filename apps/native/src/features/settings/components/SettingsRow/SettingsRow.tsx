import type { ReactNode } from "react";

import { View, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

export interface SettingsRowProps {
  label?: string;
  sublabel?: string;
  children?: ReactNode;
  fullWidth?: boolean;
  /** Renders the control in its own full-width row below the label, for controls too wide to fit inline. */
  stacked?: boolean;
  onPress?: () => void;
  hideBorder?: boolean;
}

function SettingsRowContent({
  label,
  sublabel,
  children,
  fullWidth,
  stacked,
}: Pick<SettingsRowProps, "label" | "sublabel" | "children" | "fullWidth" | "stacked">) {
  const labelGroup = (
    <View style={styles.labelGroup}>
      {label && (
        <AppText variant="bodyMd" style={styles.label}>
          {label}
        </AppText>
      )}
      {sublabel && (
        <AppText variant="caption" style={styles.sublabel}>
          {sublabel}
        </AppText>
      )}
    </View>
  );

  if (fullWidth) return <View style={styles.fullWidthContent}>{children}</View>;
  if (stacked) {
    return (
      <View style={styles.stackedContent} testID="settings-row-stacked-content">
        {labelGroup}
        {children && <View style={styles.stackedControl}>{children}</View>}
      </View>
    );
  }
  return (
    <>
      {labelGroup}
      {children && <View style={styles.control}>{children}</View>}
    </>
  );
}

export function SettingsRow({
  label,
  sublabel,
  children,
  fullWidth = false,
  stacked = false,
  onPress,
  hideBorder = false,
}: SettingsRowProps) {
  const isClickable = Boolean(onPress);

  return (
    <Pressable
      onPress={onPress}
      disabled={!isClickable}
      style={({ pressed }) => [
        styles.row,
        hideBorder && styles.noBorder,
        pressed && isClickable && styles.pressed,
      ]}
    >
      <SettingsRowContent label={label} sublabel={sublabel} fullWidth={fullWidth} stacked={stacked}>
        {children}
      </SettingsRowContent>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.component.gapLg,
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
  pressed: {
    backgroundColor: theme.colors.surface.hover,
  },
  fullWidthContent: {
    flex: 1,
    width: "100%",
  },
  labelGroup: {
    flex: 1,
    gap: theme.spacing.scale.xs,
  },
  label: {
    fontWeight: "500",
    color: theme.colors.content.default,
  },
  sublabel: {
    color: theme.colors.content.muted,
  },
  control: {
    justifyContent: "center",
    alignItems: "center",
  },
  stackedContent: {
    width: "100%",
    gap: theme.spacing.scale.sm,
  },
  stackedControl: {
    alignItems: "flex-start",
    width: "100%",
  },
}));
