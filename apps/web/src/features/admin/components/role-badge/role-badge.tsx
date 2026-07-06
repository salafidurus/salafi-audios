import type { ReactNode } from "react";
import styles from "./role-badge.module.css";

type RoleBadgeProps = {
  role: string;
};

export function RoleBadge({ role }: RoleBadgeProps): ReactNode {
  const isAdmin = role === "admin";

  return <span className={`${styles.badge} ${isAdmin ? styles.admin : styles.user}`}>{role}</span>;
}
