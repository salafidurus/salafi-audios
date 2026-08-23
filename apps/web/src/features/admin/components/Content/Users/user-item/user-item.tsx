import type { AdminUserListItemDto } from "@sd/core-contracts";
import type { ReactNode } from "react";

import { useAbility } from "@sd/domain-account";
import { MoreHorizontal, ShieldCog } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { List } from "@/shared/components/List";
import { Button } from "@/shared/components/ui/button";
import { UserAvatar } from "@/shared/components/user-avatar";
import { useIsDesktop } from "@/shared/hooks/use-responsive";

import { MetaDetails } from "./meta-details";
import styles from "./user-item.module.css";

export type UserItemProps = {
  user: AdminUserListItemDto;
  onManageAccess?: () => void;
};

export function UserItem({ user, onManageAccess }: UserItemProps): ReactNode {
  const isDesktop = useIsDesktop();
  const isCompact = !isDesktop;
  const { t } = useTranslation();
  const { ability } = useAbility();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasAccess = user.roles.length > 0;
  const displayName = user.name || t("admin.users.unnamed", "Unnamed user");

  const copyEmail = () => {
    void navigator.clipboard?.writeText(user.email);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      // SAFETY: DOM mouse events always expose a Node target in the browser document.
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [isMenuOpen]);

  return (
    <List.Item interactive className={styles.item}>
      <div className={styles.rowContainer} data-testid="admin-user-row">
        <div className={styles.avatarBlock}>
          <UserAvatar image={user.image} name={user.name} fill />
        </div>
        <div className={styles.contentBody}>
          <MetaDetails user={user} />
        </div>
      </div>

      <span
        className={`${styles.status} ${hasAccess ? styles.statusActive : styles.statusInactive}`}
      >
        {hasAccess
          ? t("admin.users.status.active", "Active access")
          : t("admin.users.status.none", "No admin access")}
      </span>

      <div className={styles.rolesList}>
        {user.roles.length > 0 ? (
          user.roles.map((role) => (
            <span key={role} className={styles.roleBadge}>
              {role}
            </span>
          ))
        ) : (
          <span className={styles.noAccess}>
            {t("admin.users.noAccessGrants", "No access grants")}
          </span>
        )}
      </div>

      <List.Item.Actions
        orientation="horizontal"
        mobileOrientation="vertical"
        className={styles.actions}
      >
        {ability.can("manage", "UserAccess") && (
          <Button
            variant={isCompact ? "outline" : "ghost"}
            size={isCompact ? "sm" : "icon"}
            fullWidth={isCompact}
            onClick={onManageAccess}
            icon={<ShieldCog size={16} />}
            aria-label={t("admin.access.manageAccessBtn", "Manage Access")}
          >
            {isCompact && t("admin.access.manageAccessBtnShort", "Access")}
          </Button>
        )}
        <div ref={menuRef} className={styles.secondaryActions}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("admin.users.moreActions", {
              defaultValue: `More actions for ${displayName}`,
              name: displayName,
            })}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            icon={<MoreHorizontal size={16} />}
          />
          {isMenuOpen && (
            <div className={styles.menu} role="menu">
              <button type="button" role="menuitem" onClick={copyEmail}>
                {t("admin.users.copyEmail", "Copy email")}
              </button>
            </div>
          )}
        </div>
      </List.Item.Actions>
    </List.Item>
  );
}
