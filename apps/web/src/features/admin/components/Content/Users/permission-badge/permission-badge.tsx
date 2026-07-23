import type { ReactNode } from "react";
import type { AdminPermission } from "@sd/core-contracts";
import { Shield } from "lucide-react";
import { PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from "@/features/admin/constants/permissions";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./permission-badge.module.css";

type PermissionBadgeProps = {
  permission: AdminPermission;
};

export function PermissionBadge({ permission }: PermissionBadgeProps): ReactNode {
  const { t } = useTranslation();
  const label = t(
    `admin.permissions.items.${permission}.label`,
    PERMISSION_LABELS[permission] ?? permission,
  );
  const description = t(
    `admin.permissions.items.${permission}.desc`,
    PERMISSION_DESCRIPTIONS[permission],
  );

  return (
    <span className={styles.badge} title={description}>
      <Shield className={styles.icon} />
      {label}
    </span>
  );
}
