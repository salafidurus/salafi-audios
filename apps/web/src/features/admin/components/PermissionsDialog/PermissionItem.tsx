"use client";

import { Toggle } from "@/shared/components/Toggle";
import { type Permission, PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from "@sd/core-contracts";
import styles from "./PermissionsDialog.module.css";

interface PermissionItemProps {
  perm: Permission;
  isPending: boolean;
  error: string | null;
  saving: boolean;
  onToggle: (perm: Permission) => void;
}

export function PermissionItem({ perm, isPending, error, saving, onToggle }: PermissionItemProps) {
  return (
    <div className={styles.permissionItem}>
      <div className={styles.permissionInfo}>
        <span className={styles.permissionName}>{PERMISSION_LABELS[perm]}</span>
        <span className={styles.permissionDescription}>{PERMISSION_DESCRIPTIONS[perm]}</span>
        {error && <span className={styles.error}>{error}</span>}
      </div>
      <Toggle
        checked={isPending}
        onChange={() => onToggle(perm)}
        disabled={saving}
        aria-label={`${isPending ? "Revoke" : "Grant"} ${PERMISSION_LABELS[perm]}`}
      />
    </div>
  );
}
