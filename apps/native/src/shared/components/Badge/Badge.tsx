import type { ReactNode } from "react";

import { Row } from "@expo/ui";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { NativeText } from "@/shared/ui/native-text";

type RoleBadgeProps = {
  variant: "role";
  role: "admin" | "user";
  testID?: string;
};

type StatusBadgeProps = {
  variant: "status";
  status: string;
  color?: "primary" | "secondary" | "muted" | "success" | "warning";
  testID?: string;
};

export type BadgeProps = RoleBadgeProps | StatusBadgeProps;

export function Badge(props: BadgeProps): ReactNode {
  const { t } = useTranslation();
  const { theme } = useUnistyles();

  if (props.variant === "role") {
    const isAdmin = props.role === "admin";
    const localizedRole = t(`role.${props.role}`, props.role);
    return (
      <Row
        testID={props.testID}
        alignment="center"
        spacing={theme.spacing.scale.xs}
        style={Object.assign({}, styles.badge, isAdmin ? styles.adminBadge : styles.userBadge)}
      >
        <NativeText
          variant="caption"
          colorRole={isAdmin ? "strong" : "default"}
          textStyle={{
            color: isAdmin ? theme.colors.content.strong : theme.colors.content.default,
          }}
        >
          {localizedRole}
        </NativeText>
      </Row>
    );
  }

  // variant === "status"
  const colorKey = props.color ?? "primary";

  return (
    <Row
      testID={props.testID}
      alignment="center"
      spacing={theme.spacing.scale.xs}
      style={Object.assign({}, styles.badge, getStatusStyleMap(theme)[colorKey])}
    >
      <NativeText variant="caption" colorRole="strong">
        {props.status}
      </NativeText>
    </Row>
  );
}

const styles = StyleSheet.create((theme) => ({
  badge: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.scale.sm,
    borderRadius: theme.radius.scale.xs,
  },
  adminBadge: {
    backgroundColor: theme.colors.action.primary,
  },
  userBadge: {
    backgroundColor: theme.colors.surface.hover,
  },
}));

type Theme = ReturnType<typeof useUnistyles>["theme"];

function getStatusStyleMap(theme: Theme) {
  return {
    primary: { backgroundColor: theme.colors.action.primary },
    secondary: { backgroundColor: theme.colors.surface.hover },
    muted: { backgroundColor: theme.colors.surface.subtle },
    success: { backgroundColor: theme.colors.state.success },
    warning: { backgroundColor: theme.colors.state.dangerSurface },
  };
}
