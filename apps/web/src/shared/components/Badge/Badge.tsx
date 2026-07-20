import type { ReactNode } from "react";
import styles from "./Badge.module.css";

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

export function Badge(props: BadgeProps): ReactNode {
  if (props.variant === "permission") {
    return (
      <span className={styles.badge}>
        {props.icon && <span className={styles.icon}>{props.icon}</span>}
        {props.permission}
      </span>
    );
  }

  if (props.variant === "role") {
    const roleClass = props.role === "admin" ? styles.admin : styles.user;
    return <span className={`${styles.badge} ${roleClass}`}>{props.role}</span>;
  }

  // variant === "status"
  const colorClass = props.color ? styles[props.color] : styles.primary;
  return <span className={`${styles.badge} ${colorClass}`}>{props.status}</span>;
}
