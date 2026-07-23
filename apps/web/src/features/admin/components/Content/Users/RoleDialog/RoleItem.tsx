"use client";

import { Toggle } from "@/shared/components/Toggle";
import type { UserRole } from "@sd/core-contracts";
import { useTranslation } from "@/core/i18n/use-translation";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "./constants";
import styles from "./RoleDialog.module.css";

interface RoleItemProps {
  role: UserRole;
  isPending: boolean;
  error: string | null;
  saving: boolean;
  onToggle: (role: UserRole) => void;
}

export function RoleItem({ role, isPending, error, saving, onToggle }: RoleItemProps) {
  const { t } = useTranslation();
  const localizedLabel = t(`role.${role}`, ROLE_LABELS[role]);

  return (
    <div className={styles.roleItem}>
      <div className={styles.roleInfo}>
        <span className={styles.roleName}>{localizedLabel}</span>
        <span className={styles.roleDescription}>
          {t(`role.descriptions.${role}`, ROLE_DESCRIPTIONS[role])}
        </span>
        {error && <span className={styles.error}>{error}</span>}
      </div>
      <Toggle
        checked={isPending}
        onChange={() => onToggle(role)}
        disabled={saving}
        aria-label={
          isPending
            ? t("role.revoke", {
                defaultValue: `Revoke ${ROLE_LABELS[role]}`,
                role: localizedLabel,
              })
            : t("role.grant", { defaultValue: `Grant ${ROLE_LABELS[role]}`, role: localizedLabel })
        }
      />
    </div>
  );
}
