import type { ReactNode } from "react";
import type { AdminUserListItemDto } from "@sd/core-contracts";
import { Shield, ShieldOff } from "lucide-react";
import { List } from "@/shared/components/List";
import { UserAvatar } from "@/shared/components/UserAvatar";
import { PermissionBadge } from "@/features/admin/components/permission-badge/permission-badge";
import { RoleBadge } from "@/features/admin/components/role-badge/role-badge";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import styles from "./user-item.module.css";

export type UserItemProps = {
  user: AdminUserListItemDto;
  onManagePermissions?: () => void;
};

export function UserItem({ user, onManagePermissions }: UserItemProps): ReactNode {
  return (
    <List.Item interactive className={styles.card}>
      <div className={styles.topRow}>
        <UserAvatar image={user.image} name={user.name} />
        <div className={styles.nameSection}>
          <div className={styles.name}>{user.name ?? "Unnamed"}</div>
          <div className={styles.email}>{user.email}</div>
        </div>
        <RoleBadge role={user.role} />
      </div>

      <div className={styles.permissions}>
        {user.permissions.length > 0 ? (
          user.permissions.map((perm) => <PermissionBadge key={perm} permission={perm} />)
        ) : (
          <span className={styles.noPerms}>
            <ShieldOff className={styles.noPermsIcon} />
            No permissions
          </span>
        )}
      </div>

      <div className={styles.joined}>Joined {new Date(user.createdAt).toLocaleDateString()}</div>

      <List.Item.Actions widthPercentDesktop="30%">
        <div onClick={(e) => e.stopPropagation()}>
          <PermissionGate requires="manage:users">
            <button type="button" className={styles.manageButton} onClick={onManagePermissions}>
              <Shield className={styles.manageIcon} />
              Manage Permissions
            </button>
          </PermissionGate>
        </div>
      </List.Item.Actions>
    </List.Item>
  );
}
