"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { useTranslation } from "@/core/i18n/use-translation";
import { routes, type AdminPermission } from "@sd/core-contracts";
import { useAuth, authClient } from "@/core/auth";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button/Button";
import { SectionLabel } from "./section-label";
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
  requiredPermission?: AdminPermission;
};

const adminNavItems: AdminNavItem[] = [
  {
    label: "Home",
    Icon: LayoutDashboard,
    href: routes.admin.index,
    activeMatch: routes.admin.index,
  },
  {
    label: "Stats",
    Icon: BarChart3,
    href: routes.admin.stats,
    activeMatch: routes.admin.stats,
  },
  {
    label: "Users",
    Icon: Users,
    href: routes.admin.users,
    activeMatch: routes.admin.users,
    requiredPermission: "USERS_VIEW",
  },
  {
    label: "Contents",
    Icon: FolderOpen,
    href: routes.admin.contents,
    activeMatch: routes.admin.contents,
    requiredPermission: "LISTINGS_VIEW",
  },
  {
    label: "Scholars",
    Icon: GraduationCap,
    href: routes.admin.scholars,
    activeMatch: routes.admin.scholars,
    requiredPermission: "SCHOLARS_VIEW",
  },
];

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
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const { data: adminPermissionsData } = useAdminPermissions();

  const adminPermissions: AdminPermission[] = adminPermissionsData?.permissions ?? [];
  const hasAdminAccess = isAuthenticated && adminPermissions.length > 0;

  const visibleAdminNavItems = adminNavItems.filter(
    (item) =>
      item.requiredPermission === undefined || adminPermissions.includes(item.requiredPermission),
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
            <SectionLabel collapsed={collapsed}>ADMIN</SectionLabel>
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
        {!isLoading && isAuthenticated && user ? (
          <div className={styles.profileRow}>
            <div className={styles.profileInfo}>
              <div className={styles.avatar}>{userInitial}</div>
              {!collapsed && (
                <div className={styles.profileDetails}>
                  <span className={styles.profileName}>{user.name || user.email || "User"}</span>
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
            <Button
              variant="primary"
              size="sm"
              className={styles.signInButton}
              onClick={() => {
                handleNavClick();
                router.push(routes.signIn);
              }}
            >
              {t("authStrip.signIn", "Sign In")}
            </Button>
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
        title="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        confirmVariant="danger"
      />
    </>
  );
}
