"use client";

import type { Permission } from "@sd/core-contracts";
import { PermissionItem } from "./PermissionItem";
import styles from "./PermissionsDialog.module.css";

interface PermissionSectionProps {
  title: string;
  permissions: Permission[];
  pendingPermissions: Set<Permission>;
  errors: Record<string, string | null>;
  saving: boolean;
  onToggle: (perm: Permission) => void;
}

export function PermissionSection({
  title,
  permissions,
  pendingPermissions,
  errors,
  saving,
  onToggle,
}: PermissionSectionProps) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.permissionsList}>
        {permissions.map((perm) => (
          <PermissionItem
            key={perm}
            perm={perm}
            isPending={pendingPermissions.has(perm)}
            error={errors[perm] ?? null}
            saving={saving}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
