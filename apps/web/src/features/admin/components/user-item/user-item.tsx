import type { ReactNode } from "react";
import type { AdminUserListItemDto } from "@sd/core-contracts";
import { Shield, Users } from "lucide-react";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/Button";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { MetaDetails } from "./meta-details";
import { PermissionDetails } from "./permission-details";
import styles from "./user-item.module.css";

export type UserItemProps = {
  user: AdminUserListItemDto;
  onManagePermissions?: () => void;
  onManageRoles?: () => void;
};

export function UserItem({ user, onManagePermissions, onManageRoles }: UserItemProps): ReactNode {
  const { isTablet } = useResponsive();
  return (
    <List.Item interactive>
      <div className={styles.card}>
        <MetaDetails user={user} />
        <PermissionDetails permissions={user.permissions.map((p) => ({ permission: p }))} />
      </div>

      <List.Item.Actions
        orientation="vertical"
        mobileOrientation="vertical"
        widthPercentDesktop="30%"
      >
        <div className={styles.actionsWrapper} onClick={(e) => e.stopPropagation()}>
          <PermissionGate requires="USERS_GRANT_PERMISSIONS">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={onManagePermissions}
              icon={<Shield className={styles.manageIcon} />}
            >
              {isTablet ? "Permissions" : "Manage Permissions"}
            </Button>
          </PermissionGate>
          <PermissionGate requires="USERS_GRANT_ROLES">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={onManageRoles}
              icon={<Users className={styles.manageIcon} />}
            >
              {isTablet ? "Roles" : "Manage Roles"}
            </Button>
          </PermissionGate>
        </div>
      </List.Item.Actions>
    </List.Item>
  );
}
