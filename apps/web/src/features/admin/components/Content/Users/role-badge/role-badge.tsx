import type { ReactNode } from "react";
import styles from "./role-badge.module.css";

type RoleBadgeProps = {
  roles: string[];
};

export function RoleBadge({ roles }: RoleBadgeProps): ReactNode {
  return (
    <div className={styles.badges}>
      {roles.map((role) => {
        const isAdmin = role === "admin";
        return (
          <span key={role} className={`${styles.badge} ${isAdmin ? styles.admin : styles.user}`}>
            {role}
          </span>
        );
      })}
    </div>
  );
}
