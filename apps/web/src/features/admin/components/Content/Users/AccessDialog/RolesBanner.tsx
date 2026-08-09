import type { ReactNode } from "react";

import styles from "./AccessDialog.module.css";

interface RolesBannerProps {
  roles: string[];
}

export function RolesBanner({ roles }: RolesBannerProps): ReactNode {
  if (roles.length === 0) return null;

  return (
    <div className={styles.rolesBanner}>
      <span>Effective Roles:</span>
      <div className={styles.rolesList}>
        {roles.map((role) => (
          <span key={role} className={styles.roleBadge}>
            {role}
          </span>
        ))}
      </div>
    </div>
  );
}
