import type { AdminUserListItemDto } from "@sd/core-contracts";
import type { ReactNode } from "react";

import { useAbility } from "@sd/domain-account";
import { Copy, ShieldCog } from "lucide-react";
import { useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { List } from "@/shared/components/List";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useResponsive } from "@/shared/hooks/use-responsive";

import { MetaDetails } from "./meta-details";
import styles from "./user-item.module.css";

export type UserItemProps = {
  user: AdminUserListItemDto;
  onManageAccess?: () => void;
  layout?: "list" | "table";
};

function renderActionButtons(
  user: AdminUserListItemDto,
  displayName: string,
  isCompact: boolean,
  canManageAccess: boolean,
  onManageAccess: (() => void) | undefined,
  copyEmail: () => void,
  t: ReturnType<typeof useTranslation>["t"],
) {
  return (
    <>
      {canManageAccess && (
        <Button
          variant={isCompact ? "outline" : "ghost"}
          size={isCompact ? "sm" : "icon"}
          fullWidth={isCompact}
          onClick={onManageAccess}
          icon={<ShieldCog aria-hidden="true" />}
          aria-label={t("admin.access.manageAccessBtn", "Manage Access")}
        >
          {isCompact && t("admin.access.manageAccessBtnShort", "Access")}
        </Button>
      )}
      <Button
        variant="ghost"
        size={isCompact ? "sm" : "icon"}
        onClick={copyEmail}
        icon={<Copy aria-hidden="true" />}
        aria-label={t("admin.users.copyEmailFor", {
          defaultValue: `Copy email for ${displayName}`,
          name: displayName,
        })}
      >
        {isCompact && t("admin.users.copyEmail", "Copy email")}
      </Button>
    </>
  );
}

export function UserItem({ user, onManageAccess, layout = "list" }: UserItemProps): ReactNode {
  const { isMobile } = useResponsive();
  const isCompact = isMobile;
  const { t, i18n } = useTranslation();
  const { ability } = useAbility();
  const displayName = user.name || t("admin.users.unnamed", "Unnamed user");
  const joinDateFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { timeZone: "UTC" }),
    [i18n.language],
  );

  const copyEmail = () => {
    void navigator.clipboard?.writeText(user.email);
  };

  const userContent = (
    <div className={styles.rowContainer} data-testid="admin-user-row">
      <div className={styles.avatarBlock}>
        <UserAvatar image={user.image} name={user.name} fill />
      </div>
      <div className={styles.contentBody}>
        <MetaDetails user={user} showJoinedDate={layout !== "table"} />
      </div>
    </div>
  );
  const rolesContent =
    user.roles.length > 0 ? (
      user.roles.map((role) => (
        <Badge key={role} variant="outline" className={styles.roleBadge}>
          {role}
        </Badge>
      ))
    ) : (
      <span className={styles.noAccess}>{t("admin.users.noAccessGrants", "No access grants")}</span>
    );
  const actionButtons = renderActionButtons(
    user,
    displayName,
    isCompact,
    ability.can("manage", "UserAccess"),
    onManageAccess,
    copyEmail,
    t,
  );

  if (layout === "table") {
    return (
      <TableRow>
        <TableCell className={styles.tableUserCell}>{userContent}</TableCell>
        <TableCell>{joinDateFormatter.format(new Date(user.createdAt))}</TableCell>
        <TableCell>
          <div className={styles.rolesList}>{rolesContent}</div>
        </TableCell>
        <TableCell className={styles.tableActionsCell}>
          <div className={styles.tableActions}>{actionButtons}</div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <List.Item interactive className={styles.item}>
      {userContent}
      <div className={styles.rolesList}>{rolesContent}</div>

      <List.Item.Actions
        orientation="horizontal"
        mobileOrientation="horizontal"
        className={styles.actions}
      >
        {actionButtons}
      </List.Item.Actions>
    </List.Item>
  );
}
