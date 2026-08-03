import type { AdminUserListItemDto } from "@sd/core-contracts";
import type { ReactNode } from "react";

import { useAbility } from "@sd/domain-account";
import { ShieldCog } from "lucide-react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Button } from "@/shared/components/Button";
import { List } from "@/shared/components/List";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useResponsive } from "@/shared/hooks/use-responsive";

import { MetaDetails } from "./meta-details";
import styles from "./user-item.module.css";

export type UserItemProps = {
  user: AdminUserListItemDto;
  onManageAccess?: () => void;
};

export function UserItem({ user, onManageAccess }: UserItemProps): ReactNode {
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
          <div className={styles.accessRoles}>
            {user.roles.length > 0 ? user.roles.join(", ") : "No access grants"}
          </div>
        </div>
      </div>

      <List.Item.Actions orientation="horizontal" mobileOrientation="vertical">
        {ability.can("manage", "UserAccess") && (
          <Button
            variant={isMobile ? "outline" : "ghost"}
            size={isMobile ? "sm" : "icon"}
            fullWidth={isMobile}
            onClick={onManageAccess}
            icon={<ShieldCog size={16} />}
            aria-label={t("admin.access.manageAccessBtn", "Manage Access")}
          >
            {isMobile && t("admin.access.manageAccessBtnShort", "Access")}
          </Button>
        )}
      </List.Item.Actions>
    </List.Item>
  );
}
