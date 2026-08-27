"use client";

import { routes, type AppActions, type AppSubjectType } from "@sd/core-contracts";
import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";
import clsx from "clsx";
import {
  BarChart3,
  Bookmark,
  Compass,
  FolderOpen,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/core/auth";
import { useSignOut } from "@/core/auth/use-sign-out";
import { useTranslation } from "@/core/i18n/use-translation";
import { LanguageSwitch } from "@/features/settings";
import { Button } from "@/shared/components/ui/button";
import { ConfirmationDialog } from "@/shared/components/ui/confirmation-dialog";
import { useResponsive } from "@/shared/hooks/use-responsive";

import { SectionLabel } from "./section-label";
import styles from "./sidebar.module.css";

type NavItem = {
  label: string;
  Icon: LucideIcon;
  href: string;
  activeMatch: string;
};

type AdminNavItem = {
  label: string;
  Icon: LucideIcon;
  href: string;
  activeMatch: string;
  requiredAction?: AppActions;
  requiredSubject?: AppSubjectType;
};

type NavLinkProps = {
  item: NavItem | AdminNavItem;
  isActive: boolean;
  onClick: () => void;
};

function NavLink({ item, isActive, onClick }: NavLinkProps) {
  return (
    <Link
      href={item.href}
      className={clsx(styles.link, isActive && styles.active)}
      aria-label={item.label}
      data-testid={`nav-link-${item.label.toLowerCase()}`}
      onClick={onClick}
    >
      <span className={styles.icon} aria-hidden="true">
        <item.Icon size={18} />
      </span>
      <span className={styles.label}>{item.label}</span>
    </Link>
  );
}

function getAdminNavItems(t: (key: string, fallback: string) => string): AdminNavItem[] {
  return [
    {
      label: t("navigation.admin.home", "Home"),
      Icon: LayoutDashboard,
      href: routes.admin.index,
      activeMatch: routes.admin.index,
    },
    {
      label: t("navigation.admin.stats", "Stats"),
      Icon: BarChart3,
      href: routes.admin.stats,
      activeMatch: routes.admin.stats,
    },
    {
      label: t("navigation.admin.users", "Users"),
      Icon: Users,
      href: routes.admin.users,
      activeMatch: routes.admin.users,
      requiredAction: "manage",
      requiredSubject: "UserAccess",
    },
    {
      label: t("navigation.admin.contents", "Contents"),
      Icon: FolderOpen,
      href: routes.admin.contents,
      activeMatch: routes.admin.contents,
    },
    {
      label: t("navigation.admin.scholars", "Scholars"),
      Icon: GraduationCap,
      href: routes.admin.scholars,
      activeMatch: routes.admin.scholars,
    },
  ];
}

function getNavItems(t: (key: string, fallback: string) => string): NavItem[] {
  return [
    {
      label: t("navigation.home", "Home"),
      Icon: Home,
      href: routes.home,
      activeMatch: routes.home,
    },
    {
      label: t("authStrip.search", "Search"),
      Icon: Search,
      href: routes.search,
      activeMatch: routes.search,
    },
    {
      label: t("navigation.explore", "Explore"),
      Icon: Compass,
      href: routes.explore.index,
      activeMatch: routes.explore.index,
    },
    {
      label: t("navigation.scholars", "Scholars"),
      Icon: GraduationCap,
      href: routes.scholars.index,
      activeMatch: routes.scholars.index,
    },
    {
      label: t("navigation.myLibrary", "My Library"),
      Icon: Bookmark,
      href: routes.myLibrary.index,
      activeMatch: routes.myLibrary.index,
    },
    {
      label: t("navigation.settings", "Settings"),
      Icon: Settings2,
      href: routes.settings.index,
      activeMatch: routes.settings.index,
    },
  ];
}

interface NavItemsProps {
  onItemClick?: () => void;
}

type AuthFooterProps = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: NonNullable<ReturnType<typeof useAuth>["user"]> | undefined;
  onItemClick: () => void;
  t: (key: string, fallback: string) => string;
};

function AuthFooter({ isAuthenticated, isLoading, user, onItemClick, t }: AuthFooterProps) {
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const { signOut, error: signOutError } = useSignOut();
  const userInitial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <>
      {!isLoading && isAuthenticated && user ? (
        <div className={styles.profileRow}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>{userInitial}</div>
            <div className={styles.profileDetails}>
              <span className={styles.profileName}>
                {user.name || user.email || t("account.defaultUser", "User")}
              </span>
              <span className={styles.profileEmail}>{user.email}</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.signOutButton}
            onClick={() => {
              onItemClick();
              setIsSignOutDialogOpen(true);
            }}
            aria-label={t("authStrip.signOut", "Sign Out")}
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : !isLoading && !isAuthenticated ? (
        <div className={styles.keepPlaceCard}>
          <p className={styles.keepPlaceTitle}>
            {t("navigation.keepYourPlace", "Keep your place")}
          </p>
          <p className={styles.keepPlaceDesc}>
            {t(
              "navigation.keepYourPlaceDesc",
              "Sign in to sync progress and saved durus across your devices.",
            )}
          </p>
          <Link href={routes.signIn} onClick={onItemClick} className={styles.signInButton}>
            <Button variant="primary" size="sm" fullWidth tabIndex={-1}>
              {t("authStrip.signIn", "Sign In")}
            </Button>
          </Link>
        </div>
      ) : null}
      <ConfirmationDialog
        open={isSignOutDialogOpen}
        onOpenChange={setIsSignOutDialogOpen}
        onConfirm={signOut}
        title={t("account.profile.signOutPrompt", "Are you sure you want to sign out?")}
        confirmLabel={t("account.signOut", "Sign Out")}
        variant="destructive"
        error={signOutError}
      />
    </>
  );
}

export function NavItems({ onItemClick }: NavItemsProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const { isMobile, isTablet } = useResponsive();
  const showLanguageSwitch = isMobile || isTablet;

  const hasAdminAccess = isAuthenticated && hasAnyAdminAccess(ability);
  const visibleAdminNavItems = getAdminNavItems(t).filter(
    (item) =>
      item.requiredAction === undefined ||
      item.requiredSubject === undefined ||
      ability.can(item.requiredAction, item.requiredSubject),
  );
  const navItems = getNavItems(t);

  const handleNavClick = () => {
    onItemClick?.();
  };

  return (
    <>
      <nav className={styles.nav} aria-label={t("navigation.mainNav")}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.activeMatch || pathname.startsWith(`${item.activeMatch}/`);
          return (
            <NavLink key={item.href} item={item} isActive={isActive} onClick={handleNavClick} />
          );
        })}

        {hasAdminAccess && (
          <>
            <hr className={styles.divider} />
            <SectionLabel>{t("navigation.adminSection", "ADMIN")}</SectionLabel>
            {visibleAdminNavItems.map((item) => {
              const isActive =
                item.href === routes.admin.index
                  ? pathname === routes.admin.index
                  : pathname.startsWith(item.href);
              return (
                <NavLink key={item.href} item={item} isActive={isActive} onClick={handleNavClick} />
              );
            })}
          </>
        )}
      </nav>

      <div className={styles.spacer} />

      <div className={styles.footer}>
        {showLanguageSwitch && (
          <div className={styles.sidebarLanguageSwitch}>
            <LanguageSwitch direction="up" />
          </div>
        )}
        <AuthFooter
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          user={user}
          onItemClick={handleNavClick}
          t={t}
        />
      </div>
    </>
  );
}
