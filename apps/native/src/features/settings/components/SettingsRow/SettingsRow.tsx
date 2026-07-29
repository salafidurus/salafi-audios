import type { ReactNode } from "react";

import { View, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

export interface SettingsRowProps {
  label?: string;
  sublabel?: string;
  children?: ReactNode;
  fullWidth?: boolean;
  onPress?: () => void;
  hideBorder?: boolean;
}

export function SettingsRow({
  label,
  sublabel,
  children,
  fullWidth = false,
  onPress,
  hideBorder = false,
}: SettingsRowProps) {
  const isClickable = Boolean(onPress);

  const content = fullWidth ? (
    <View style={styles.fullWidthContent}>{children}</View>
  ) : (
    <>
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
      {children && <View style={styles.control}>{children}</View>}
    </>
  );

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
      {content}
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
}));
