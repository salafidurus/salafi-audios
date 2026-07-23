"use client";

import { Toggle } from "@/shared/components/Toggle";
import { type Permission, PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from "@sd/core-contracts";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./PermissionsDialog.module.css";

interface PermissionItemProps {
  perm: Permission;
  isPending: boolean;
  error: string | null;
  saving: boolean;
  onToggle: (perm: Permission) => void;
}

export function PermissionItem({ perm, isPending, error, saving, onToggle }: PermissionItemProps) {
  const { t } = useTranslation();
  const label = t(`admin.permissions.items.${perm}.label`, PERMISSION_LABELS[perm] ?? perm);
  const description = t(`admin.permissions.items.${perm}.desc`, PERMISSION_DESCRIPTIONS[perm]);

  return (
    <div className={styles.permissionItem}>
      <div className={styles.permissionInfo}>
        <span className={styles.permissionName}>{label}</span>
        <span className={styles.permissionDescription}>{description}</span>
        {error && <span className={styles.error}>{error}</span>}
      </div>
      <Toggle
        checked={isPending}
        onChange={() => onToggle(perm)}
        disabled={saving}
        aria-label={`${isPending ? "Revoke" : "Grant"} ${label}`}
      />
    </div>
  );
}
