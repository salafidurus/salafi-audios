"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useTranslation } from "@/core/i18n/use-translation";
import { routes } from "@sd/core-contracts";
import { useAuth, authClient } from "@/core/auth";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { SectionLabel } from "./section-label";
import { Button } from "@/shared/components/Button/Button";
import {
  PanelLeftOpen,
  PanelRightOpen,
  Cloud,
  Mic,
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
};

const adminNavItems: AdminNavItem[] = [
  {
    label: "Home",
    Icon: LayoutDashboard,
    href: "/admin",
    activeMatch: "/admin",
  },
  {
    label: "Stats",
    Icon: BarChart3,
    href: "/admin/stats",
    activeMatch: "/admin/stats",
  },
  {
    label: "Users",
    Icon: Users,
    href: "/admin/users",
    activeMatch: "/admin/users",
  },
  {
    label: "Contents",
    Icon: FolderOpen,
    href: "/admin/contents",
    activeMatch: "/admin/contents",
  },
  {
    label: "Scholars",
    Icon: GraduationCap,
    href: "/admin/scholars",
    activeMatch: "/admin/scholars",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, user, isLoading } = useAuth();

  const { data: adminPermissionsData } = useAdminPermissions({
    enabled: isAuthenticated,
  });

  const hasAdminAccess = (adminPermissionsData?.permissions ?? []).length > 0;
  const accountHref = routes.account.index;

  const navItems: NavItem[] = [
    {
      label: t("authStrip.search", "Search"),
      Icon: Search,
      href: routes.search,
      activeMatch: routes.search,
    },
    {
      label: t("navigation.explore"),
      Icon: Cloud,
      href: routes.feed.index,
      activeMatch: routes.feed.index,
    },
    {
      label: t("navigation.live"),
      Icon: Mic,
      href: routes.live.index,
      activeMatch: routes.live.index,
    },
    {
      label: t("navigation.library"),
      Icon: CassetteTape,
      href: routes.library.index,
      activeMatch: routes.library.index,
    },
  ];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sidebar-width", collapsed ? "4.5rem" : "16.5rem");
  }, [collapsed]);

  const userInitial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <aside
      className={clsx(styles.sidebar, collapsed && styles.collapsed)}
      aria-label={t("navigation.primarySidebar")}
      data-collapsed={collapsed}
    >
      <div className={styles.brandRow}>
        <Link href={routes.home} className={styles.brand} aria-label={t("navigation.siteTitle")}>
          <span className={styles.brandMark} aria-hidden="true">
            <Image
              src="/logo/logo_72.png"
              alt=""
              width={32}
              height={32}
              priority
              className={styles.brandImg}
            />
          </span>
          <span className={styles.brandText}>{t("navigation.siteTitle")}</span>
        </Link>
        <button
          type="button"
          className={styles.collapseButton}
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? t("navigation.expandSidebar") : t("navigation.collapseSidebar")}
        >
          {collapsed ? <PanelRightOpen size={16} /> : <PanelLeftOpen size={16} />}
        </button>
      </div>

      <nav className={styles.nav} aria-label={t("navigation.mainNav")}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.activeMatch || pathname.startsWith(`${item.activeMatch}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(styles.link, isActive && styles.active)}
            >
              <span className={styles.icon} aria-hidden="true">
                <item.Icon size={18} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
        <Link
          href={accountHref}
          className={clsx(styles.link, pathname.startsWith(routes.account.index) && styles.active)}
        >
          <span className={styles.icon} aria-hidden="true">
            <Settings size={18} />
          </span>
          <span className={styles.label}>{t("navigation.settings", "Settings")}</span>
        </Link>

        {hasAdminAccess && (
          <>
            <hr className={styles.divider} />
            <SectionLabel collapsed={collapsed}>ADMIN</SectionLabel>
            {adminNavItems.map((item) => {
              const isActive =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(styles.link, isActive && styles.active)}
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

      <div className={styles.spacer} />

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
            {!collapsed && (
              <button
                type="button"
                className={styles.signOutButton}
                onClick={() => void authClient.signOut().then(() => router.push(routes.home))}
                aria-label={t("authStrip.signOut", "Sign Out")}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        ) : !isLoading && !isAuthenticated ? (
          collapsed ? (
            <Link
              href={routes.signIn}
              className={styles.collapsedSignInButton}
              aria-label={t("authStrip.signIn", "Sign In")}
            >
              <LogIn size={18} />
            </Link>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className={styles.signInButton}
              onClick={() => router.push(routes.signIn)}
            >
              {t("authStrip.signIn", "Sign In")}
            </Button>
          )
        ) : null}
      </div>
    </aside>
  );
}
