"use client";

import { Toggle } from "@/shared/components/Toggle";
import type { UserRole } from "@sd/core-contracts";
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
  return (
    <div className={styles.roleItem}>
      <div className={styles.roleInfo}>
        <span className={styles.roleName}>{ROLE_LABELS[role]}</span>
        <span className={styles.roleDescription}>{ROLE_DESCRIPTIONS[role]}</span>
        {error && <span className={styles.error}>{error}</span>}
      </div>
      <Toggle
        checked={isPending}
        onChange={() => onToggle(role)}
        disabled={saving}
        aria-label={`${isPending ? "Revoke" : "Grant"} ${ROLE_LABELS[role]}`}
      />
    </div>
  );
}
