import type { ReactNode } from "react";

import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        <AppText variant="titleLg" style={styles.title}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="bodySm" style={styles.subtitle}>
            {subtitle}
          </AppText>
        )}
      </View>
      {actions && <View style={styles.actions}>{actions}</View>}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.scale.lg,
  },
  titleGroup: {
    flex: 1,
    gap: theme.spacing.scale.xs,
  },
  title: {
    color: theme.colors.content.strong,
  },
  subtitle: {
    color: theme.colors.content.muted,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.sm,
  },
}));
