import type { ReactNode } from "react";
import { Shield } from "lucide-react";
import styles from "./permission-badge.module.css";

type PermissionBadgeProps = {
  permission: string;
};

export function PermissionBadge({ permission }: PermissionBadgeProps): ReactNode {
  return (
    <span className={styles.badge}>
      <Shield className={styles.icon} />
      {permission}
    </span>
  );
}
