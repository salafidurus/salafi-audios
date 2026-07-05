import type { ReactNode } from "react";
import type { AdminUserListItemDto } from "@sd/core-contracts";
import { ShieldOff } from "lucide-react";
import { UserAvatar } from "@/features/admin/components/user-avatar/user-avatar";
import { PermissionBadge } from "@/features/admin/components/permission-badge/permission-badge";
import { RoleBadge } from "@/features/admin/components/role-badge/role-badge";
import styles from "./user-row.module.css";

type UserRowProps = {
  user: AdminUserListItemDto;
};

export function UserRow({ user }: UserRowProps): ReactNode {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <div className={styles.userInfo}>
          <UserAvatar image={user.image} name={user.name} />
          <span className={styles.name}>{user.name ?? "Unnamed"}</span>
        </div>
      </td>
      <td className={`${styles.cell} ${styles.email}`}>{user.email}</td>
      <td className={styles.cell}>
        <RoleBadge role={user.role} />
      </td>
      <td className={styles.cell}>
        <div className={styles.permissions}>
          {user.permissions.length > 0 ? (
            user.permissions.map((perm) => (
              <PermissionBadge key={perm} permission={perm} />
            ))
          ) : (
            <span className={styles.noPerms}>
              <ShieldOff className={styles.noPermsIcon} />
              None
            </span>
          )}
        </div>
      </td>
      <td className={`${styles.cell} ${styles.date}`}>
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}
