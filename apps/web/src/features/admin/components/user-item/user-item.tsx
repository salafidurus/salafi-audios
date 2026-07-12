import type { ReactNode } from "react";
import type { AdminUserListItemDto } from "@sd/core-contracts";
import { Shield } from "lucide-react";
import { List } from "@/shared/components/List";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { MetaDetails } from "./meta-details";
import { PermissionDetails } from "./permission-details";
import styles from "./user-item.module.css";

export type UserItemProps = {
  user: AdminUserListItemDto;
  onManagePermissions?: () => void;
};

export function UserItem({ user, onManagePermissions }: UserItemProps): ReactNode {
  const { isTablet } = useResponsive();
  return (
    <List.Item interactive>
      <div className={styles.card}>
        <MetaDetails user={user} />
        <PermissionDetails permissions={user.permissions.map((p) => ({ permission: p }))} />
      </div>

      <List.Item.Actions widthPercentDesktop="30%">
        <div onClick={(e) => e.stopPropagation()}>
          <PermissionGate requires="USERS_VIEW">
            <button type="button" className={styles.manageButton} onClick={onManagePermissions}>
              <Shield className={styles.manageIcon} />
              {isTablet ? "Permissions" : "Manage Permissions"}
            </button>
          </PermissionGate>
        </div>
      </List.Item.Actions>
    </List.Item>
  );
}
