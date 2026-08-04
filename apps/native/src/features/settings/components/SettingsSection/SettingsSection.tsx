import type { ReactNode } from "react";

import { Column } from "@expo/ui";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { NativeText } from "@/shared/ui/native-text";

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  const { theme } = useUnistyles();

  return (
    <Column spacing={theme.spacing.scale.md}>
      <Column spacing={theme.spacing.scale.xs}>
        <NativeText variant="labelMd" colorRole="muted" textStyle={styles.title}>
          {title}
        </NativeText>
        {description ? (
          <NativeText variant="caption" colorRole="muted">
            {description}
          </NativeText>
        ) : null}
      </Column>
      <Column style={styles.rows}>{children}</Column>
    </Column>
  );
}

const styles = StyleSheet.create((theme) => ({
  title: {
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  rows: {
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.panel,
    overflow: "hidden",
    backgroundColor: theme.colors.surface.default,
  },
}));
