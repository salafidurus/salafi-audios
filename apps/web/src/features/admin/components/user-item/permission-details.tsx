import type { ReactNode } from "react";
import type { AdminPermission } from "@sd/core-contracts";
import { ShieldOff } from "lucide-react";
import { PermissionBadge } from "../permission-badge/permission-badge";
import styles from "./permission-details.module.css";

type PermissionDetailsProps = {
  permissions: Array<{ permission: AdminPermission }>;
};

export function PermissionDetails({ permissions }: PermissionDetailsProps): ReactNode {
  if (permissions.length === 0) {
    return (
      <div className={styles.noPerms}>
        <ShieldOff className={styles.noPermsIcon} />
        No permissions
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {permissions.map((perm) => (
        <PermissionBadge key={perm.permission} permission={perm.permission} />
      ))}
    </div>
  );
}
