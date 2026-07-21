import type { ReactNode } from "react";
import type { AdminUserListItemDto } from "@sd/core-contracts";
import { ShieldCog, UserCog } from "lucide-react";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/Button";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
import { useTranslation } from "@/core/i18n/use-translation";
import { MetaDetails } from "./meta-details";
import { PermissionDetails } from "./permission-details";
import styles from "./user-item.module.css";

export type UserItemProps = {
  user: AdminUserListItemDto;
  onManagePermissions?: () => void;
  onManageRoles?: () => void;
};

export function UserItem({ user, onManagePermissions, onManageRoles }: UserItemProps): ReactNode {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();

  return (
    <List.Item interactive>
      <div className={styles.card}>
        <MetaDetails user={user} />
        <PermissionDetails permissions={user.permissions.map((p) => ({ permission: p }))} />
      </div>

      <List.Item.Actions
        orientation="horizontal"
        mobileOrientation="vertical"
        widthPercentDesktop="15%"
      >
        <PermissionGate requires="USERS_GRANT_PERMISSIONS">
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            onClick={onManagePermissions}
            icon={<ShieldCog size={16} />}
            aria-label={t("admin.permissions.managePermissionsBtn", "Manage Permissions")}
          >
            {isMobile && t("admin.permissions.managePermissionsBtnShort", "Permissions")}
          </Button>
        </PermissionGate>
        <PermissionGate requires="USERS_GRANT_ROLES">
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            onClick={onManageRoles}
            icon={<UserCog size={16} />}
            aria-label={t("admin.permissions.manageRolesBtn", "Manage Roles")}
          >
            {isMobile && t("admin.permissions.manageRolesBtnShort", "Roles")}
          </Button>
        </PermissionGate>
      </List.Item.Actions>
    </List.Item>
  );
}
