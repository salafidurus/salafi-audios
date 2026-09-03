/** Defines the persistent narrow-layout navigation boundary for public routes. */
"use client";

import { routes } from "@sd/core-contracts";
import { Bookmark, Compass, GraduationCap, Home, Settings, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTranslation } from "@/core/i18n/use-translation";
import { useResponsive } from "@/shared/hooks/use-responsive";

import styles from "./bottom-navigation.module.css";

type BottomNavigationItem = {
  label: string;
  href: string;
  Icon: LucideIcon;
};

function isActivePath(pathname: string, href: string) {
  return href === routes.home
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Provides the five persistent listener-facing destinations on mobile and
 * tablet. It preserves canonical routes, exposes the current destination
 * through `aria-current`, and is omitted for desktop and admin workspaces.
 */
export function BottomNavigation() {
  const { isMobile, isTablet } = useResponsive();
  const pathname = usePathname();
  const { t } = useTranslation();

  if (
    (!isMobile && !isTablet) ||
    pathname === routes.admin.index ||
    pathname.startsWith(`${routes.admin.index}/`)
  ) {
    return null;
  }

  const items: BottomNavigationItem[] = [
    { label: t("navigation.home", "Home"), href: routes.home, Icon: Home },
    { label: t("navigation.explore", "Explore"), href: routes.explore.index, Icon: Compass },
    {
      label: t("navigation.scholars", "Scholars"),
      href: routes.scholars.index,
      Icon: GraduationCap,
    },
    {
      label: t("navigation.myLibrary", "My Library"),
      href: routes.myLibrary.index,
      Icon: Bookmark,
    },
    { label: t("navigation.settings", "Settings"), href: routes.settings.index, Icon: Settings },
  ];

  return (
    <nav className={styles.navigation} aria-label={t("navigation.bottomNav", "Bottom navigation")}>
      <ul className={styles.list}>
        {items.map(({ label, href, Icon }) => {
          const isActive = isActivePath(pathname, href);

          return (
            <li key={href} className={styles.item}>
              <Link
                href={href}
                className={styles.link}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={styles.icon} aria-hidden="true" size={20} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
