/** Groups related settings content into the native bordered section primitive. */
import type { ReactNode } from "react";

import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/ui";

/** Carries the visible heading and row subtree; rows stay grouped under one bordered panel. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module/declaration comments are both present above.
export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Groups related settings rows under a native heading and description. */
export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <AppText variant="labelMd" style={styles.title}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="caption" style={styles.description}>
            {description}
          </AppText>
        ) : null}
      </View>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: theme.spacing.scale.md,
  },
  heading: {
    gap: theme.spacing.scale.xs,
  },
  title: {
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  description: {
    color: theme.colors.content.muted,
  },
  rows: {
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.panel,
    overflow: "hidden",
    backgroundColor: theme.colors.surface.default,
  },
}));
