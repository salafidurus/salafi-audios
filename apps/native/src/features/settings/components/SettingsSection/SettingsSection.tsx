import type { ReactNode } from "react";

import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

/** Provides the native features settings components SettingsSection SettingsSection module responsibility. */
/** Describes the SettingsSectionProps native interface contract and behavior. */
export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Describes the SettingsSection native function contract and behavior. */
export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="labelMd" style={styles.title}>
          {title}
        </AppText>
        {description && (
          <AppText variant="caption" style={styles.description}>
            {description}
          </AppText>
        )}
      </View>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    marginBottom: theme.spacing.scale["2xl"],
  },
  header: {
    marginBottom: theme.spacing.scale.md,
  },
  title: {
    color: theme.colors.content.muted,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  description: {
    color: theme.colors.content.muted,
    marginTop: theme.spacing.scale.xs,
  },
  rows: {
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.panel,
    overflow: "hidden",
    backgroundColor: theme.colors.surface.default,
  },
}));
