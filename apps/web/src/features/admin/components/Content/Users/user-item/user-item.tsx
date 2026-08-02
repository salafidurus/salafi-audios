import type { AdminUserListItemDto } from "@sd/core-contracts";
import type { ReactNode } from "react";

import { useAbility } from "@sd/domain-account";
import { BookUser, Languages, ShieldCog, UserCog } from "lucide-react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/Button";
import { List } from "@/shared/components/List";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useResponsive } from "@/shared/hooks/use-responsive";

import { MetaDetails } from "./meta-details";
import { PermissionDetails } from "./permission-details";
import styles from "./user-item.module.css";

export type UserItemProps = {
  user: AdminUserListItemDto;
  onManagePermissions?: () => void;
  onManageRoles?: () => void;
  onManageScholarRoles?: () => void;
  onManageTranslatorRoles?: () => void;
};

export function UserItem({
  user,
  onManagePermissions,
  onManageRoles,
  onManageScholarRoles,
  onManageTranslatorRoles,
}: UserItemProps): ReactNode {
  const { isMobile } = useResponsive();
  const { t } = useTranslation();
  const { ability } = useAbility();

  return (
    <List.Item interactive>
      <div className={styles.rowContainer}>
        <div className={styles.avatarBlock}>
          <UserAvatar image={user.image} name={user.name} fill />
        </div>
        <div className={styles.contentBody}>
          <MetaDetails user={user} />
          <PermissionDetails permissions={user.permissions.map((p) => ({ permission: p }))} />
        </div>
      </div>

      <List.Item.Actions orientation="horizontal" mobileOrientation="vertical">
        {ability.can("grant", "UserPermission") && (
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
        )}
        {ability.can("grant", "UserRoleAssignment") && (
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
        )}
        {ability.can("grant", "UserScholarRole") && (
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            onClick={onManageScholarRoles}
            icon={<BookUser size={16} />}
            aria-label={t("admin.permissions.manageScholarAccessBtn", "Manage Scholar Access")}
          >
            {isMobile && t("admin.permissions.manageScholarAccessBtnShort", "Scholars")}
          </Button>
        )}
        {ability.can("grant", "UserTranslatorRole") && (
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            onClick={onManageTranslatorRoles}
            icon={<Languages size={16} />}
            aria-label={t(
              "admin.permissions.manageTranslatorLocalesBtn",
              "Manage Translator Locales",
            )}
          >
            {isMobile && t("admin.permissions.manageTranslatorLocalesBtnShort", "Locales")}
          </Button>
        )}
      </List.Item.Actions>
    </List.Item>
  );
}
