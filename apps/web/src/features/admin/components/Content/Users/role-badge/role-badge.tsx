import type { ReactNode } from "react";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./role-badge.module.css";

type RoleBadgeProps = {
  roles: string[];
};

export function RoleBadge({ roles }: RoleBadgeProps): ReactNode {
  const { t } = useTranslation();

  return (
    <div className={styles.badges}>
      {roles.map((role) => {
        const isAdmin = role === "admin" || role === "superadmin";
        const localizedRole = t(`role.${role}`, role);
        return (
          <span key={role} className={`${styles.badge} ${isAdmin ? styles.admin : styles.user}`}>
            {localizedRole}
          </span>
        );
      })}
    </div>
  );
}
