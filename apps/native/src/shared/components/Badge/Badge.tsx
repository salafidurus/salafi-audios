import type { ReactNode } from "react";

import { View, type ViewStyle } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";

type PermissionBadgeProps = {
  variant: "permission";
  permission: string;
  icon?: ReactNode;
};

type RoleBadgeProps = {
  variant: "role";
  role: "admin" | "user";
};

type StatusBadgeProps = {
  variant: "status";
  status: string;
  color?: "primary" | "secondary" | "muted" | "success" | "warning";
};

export type BadgeProps = PermissionBadgeProps | RoleBadgeProps | StatusBadgeProps;

const statusStyleMap: Record<string, ViewStyle> = {
  primary: styles.status_primary,
  secondary: styles.status_secondary,
  muted: styles.status_muted,
  success: styles.status_success,
  warning: styles.status_warning,
};

export function Badge(props: BadgeProps): ReactNode {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  if (props.variant === "permission") {
    return (
      <View style={[styles.badge, styles.permissionBadge]}>
        {props.icon}
        <AppText variant="caption" style={styles.permissionText}>
          {props.permission}
        </AppText>
      </View>
    );
  }

  if (props.variant === "role") {
    const isAdmin = props.role === "admin";
    const localizedRole = t(`role.${props.role}`, props.role);
    return (
      <View style={[styles.badge, isAdmin ? styles.adminBadge : styles.userBadge]}>
        <AppText
          variant="caption"
          style={{ color: isAdmin ? theme.colors.content.strong : theme.colors.content.default }}
        >
          {localizedRole}
        </AppText>
      </View>
    );
  }

  // variant === "status"
  const colorKey = props.color ?? "primary";

  return (
    <View style={[styles.badge, statusStyleMap[colorKey]]}>
      <AppText variant="caption" style={styles.statusText}>
        {props.status}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  badge: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.scale.sm,
    borderRadius: theme.radius.scale.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.xs,
    alignSelf: "flex-start",
  },
  permissionBadge: {
    backgroundColor: theme.colors.surface.hover,
  },
  permissionText: {
    color: theme.colors.content.default,
  },
  adminBadge: {
    backgroundColor: theme.colors.action.primary,
  },
  userBadge: {
    backgroundColor: theme.colors.surface.hover,
  },
  statusText: {
    color: theme.colors.content.strong,
  },
  status_primary: {
    backgroundColor: theme.colors.action.primary,
  },
  status_secondary: {
    backgroundColor: theme.colors.surface.hover,
  },
  status_muted: {
    backgroundColor: theme.colors.surface.subtle,
  },
  status_success: {
    backgroundColor: theme.colors.state.success,
  },
  status_warning: {
    backgroundColor: theme.colors.state.dangerSurface,
  },
}));
