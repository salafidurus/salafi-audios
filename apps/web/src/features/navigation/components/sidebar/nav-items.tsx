"use client";

import { routes, type AppActions, type AppSubjectType } from "@sd/core-contracts";
import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";
import clsx from "clsx";
import {
  Cloud,
  CassetteTape,
  Settings,
  Search,
  LogIn,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Users,
  FolderOpen,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth, authClient } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LanguageSwitch } from "@/features/settings";
import { Button } from "@/shared/components/Button/Button";
import { Modal } from "@/shared/components/Modal";
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

/**
 * Factory function to create main nav items with translations
 * Takes translation function to avoid recreating array on every render
 */
function getNavItems(t: (key: string, fallback: string) => string): NavItem[] {
  return [
    {
      label: t("authStrip.search", "Search"),
      Icon: Search,
      href: routes.search,
      activeMatch: routes.search,
    },
    {
      label: t("navigation.explore", "Explore"),
      Icon: Cloud,
      href: routes.explore.index,
      activeMatch: routes.explore.index,
    },
    {
      label: t("navigation.library", "Library"),
      Icon: CassetteTape,
      href: routes.library.index,
      activeMatch: routes.library.index,
    },
  ];
}

interface NavItemsProps {
  collapsed?: boolean;
  onItemClick?: () => void;
}

export function NavItems({ collapsed = false, onItemClick }: NavItemsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const { isMobile, isTablet } = useResponsive();
  const showLanguageSwitch = isMobile || isTablet;

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const hasAdminAccess = isAuthenticated && hasAnyAdminAccess(ability);
  const visibleAdminNavItems = getAdminNavItems(t).filter(
    (item) =>
      item.requiredAction === undefined ||
      item.requiredSubject === undefined ||
      ability.can(item.requiredAction, item.requiredSubject),
  );
  const settingsHref = routes.settings.index;

  const navItems = getNavItems(t);

  const userInitial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  const handleNavClick = () => {
    onItemClick?.();
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className={styles.nav} aria-label={t("navigation.mainNav")}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.activeMatch || pathname.startsWith(`${item.activeMatch}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(styles.link, isActive && styles.active)}
              aria-label={item.label}
              data-testid={`nav-link-${item.label.toLowerCase()}`}
              title={collapsed ? item.label : undefined}
              onClick={handleNavClick}
            >
              <span className={styles.icon} aria-hidden="true">
                <item.Icon size={18} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}

        {/* Settings */}
        <Link
          href={settingsHref}
          className={clsx(styles.link, pathname.startsWith(routes.settings.index) && styles.active)}
          aria-label={t("navigation.settings", "Settings")}
          title={collapsed ? t("navigation.settings", "Settings") : undefined}
          onClick={handleNavClick}
        >
          <span className={styles.icon} aria-hidden="true">
            <Settings size={18} />
          </span>
          <span className={styles.label}>{t("navigation.settings", "Settings")}</span>
        </Link>

        {/* Admin Section */}
        {hasAdminAccess && (
          <>
            <hr className={styles.divider} />
            <SectionLabel collapsed={collapsed}>
              {t("navigation.adminSection", "ADMIN")}
            </SectionLabel>
            {visibleAdminNavItems.map((item) => {
              const isActive =
                item.href === routes.admin.index
                  ? pathname === routes.admin.index
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(styles.link, isActive && styles.active)}
                  aria-label={item.label}
                  title={collapsed ? item.label : undefined}
                  onClick={handleNavClick}
                >
                  <span className={styles.icon} aria-hidden="true">
                    <item.Icon size={18} />
                  </span>
                  <span className={styles.label}>{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* Footer - User Profile / Auth */}
      <div className={styles.footer}>
        {showLanguageSwitch && (
          <div className={styles.sidebarLanguageSwitch}>
            <LanguageSwitch direction="up" collapsed={collapsed} />
          </div>
        )}
        {!isLoading && isAuthenticated && user ? (
          <div className={styles.profileRow}>
            <div className={styles.profileInfo}>
              <div className={styles.avatar}>{userInitial}</div>
              {!collapsed && (
                <div className={styles.profileDetails}>
                  <span className={styles.profileName}>
                    {user.name || user.email || t("account.defaultUser", "User")}
                  </span>
                  <span className={styles.profileEmail}>{user.email}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              className={styles.signOutButton}
              onClick={() => {
                handleNavClick();
                setIsSignOutDialogOpen(true);
              }}
              aria-label={t("authStrip.signOut", "Sign Out")}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : !isLoading && !isAuthenticated ? (
          collapsed ? (
            <Link
              href={routes.signIn}
              className={styles.collapsedSignInButton}
              aria-label={t("authStrip.signIn", "Sign In")}
              onClick={handleNavClick}
            >
              <LogIn size={18} />
            </Link>
          ) : (
            <Link href={routes.signIn} onClick={handleNavClick} className={styles.signInButton}>
              <Button variant="primary" size="sm" style={{ width: "100%" }} tabIndex={-1}>
                {t("authStrip.signIn", "Sign In")}
              </Button>
            </Link>
          )
        ) : null}
      </div>

      <Modal.ConfirmDialog
        isOpen={isSignOutDialogOpen}
        onClose={() => setIsSignOutDialogOpen(false)}
        onConfirm={async () => {
          try {
            await authClient.signOut();
          } catch (err) {
            console.error("Sign out error", err);
          } finally {
            if (typeof window !== "undefined" && window.location && !process.env.VITEST) {
              window.location.href = "/";
            } else {
              router.push("/");
            }
          }
        }}
        title={t("account.profile.signOutPrompt", "Are you sure you want to sign out?")}
        confirmLabel={t("account.signOut", "Sign Out")}
        confirmVariant="danger"
      />
    </>
  );
}
