import type { ReactNode } from "react";
import type { AdminUserListItemDto } from "@sd/core-contracts";
import { ShieldOff } from "lucide-react";
import { UserAvatar } from "@/features/admin/components/user-avatar/user-avatar";
import { PermissionBadge } from "@/features/admin/components/permission-badge/permission-badge";
import { RoleBadge } from "@/features/admin/components/role-badge/role-badge";
import styles from "./user-card.module.css";

type UserCardProps = {
  user: AdminUserListItemDto;
};

export function UserCard({ user }: UserCardProps): ReactNode {
  return (
    <div className={styles.card}>
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
    </div>
  );
}
