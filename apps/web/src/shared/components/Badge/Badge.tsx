import type { ReactNode } from "react";

import { useTranslation } from "@/core/i18n/use-translation";

import styles from "./Badge.module.css";

type RoleBadgeProps = {
  variant: "role";
  role: "admin" | "user";
};

type StatusBadgeProps = {
  variant: "status";
  status: string;
  color?: "primary" | "secondary" | "muted" | "success" | "warning";
};

export type BadgeProps = RoleBadgeProps | StatusBadgeProps;

export function Badge(props: BadgeProps): ReactNode {
  const { t } = useTranslation();

  if (props.variant === "role") {
    const roleClass = props.role === "admin" ? styles.admin : styles.user;
    const localizedRole = t(`role.${props.role}`, props.role);
    return <span className={`${styles.badge} ${roleClass}`}>{localizedRole}</span>;
  }

  // variant === "status"
  const colorClass = props.color ? styles[props.color] : styles.primary;
  return <span className={`${styles.badge} ${colorClass}`}>{props.status}</span>;
}
