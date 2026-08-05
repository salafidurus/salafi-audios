"use client";

import { routes } from "@sd/core-contracts";
import { Bookmark, GraduationCap, Home, Search, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTranslation } from "@/core/i18n/use-translation";

import styles from "./mobile-bottom-nav.module.css";

const NAV_ITEMS = [
  { id: "home", labelKey: "nav.home", defaultLabel: "Home", href: routes.home, Icon: Home },
  {
    id: "search",
    labelKey: "nav.search",
    defaultLabel: "Search",
    href: routes.search,
    Icon: Search,
  },
  {
    id: "scholars",
    labelKey: "nav.scholars",
    defaultLabel: "Scholars",
    href: routes.scholars.index,
    Icon: GraduationCap,
  },
  {
    id: "library",
    labelKey: "nav.library",
    defaultLabel: "Library",
    href: routes.library.index,
    Icon: Bookmark,
  },
  {
    id: "settings",
    labelKey: "nav.settings",
    defaultLabel: "Settings",
    href: routes.settings.index,
    Icon: Settings2,
  },
];

export function MobileBottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <nav className={styles.bar} aria-label={t("nav.mobileAria", "Mobile navigation")}>
      <div className={styles.inner}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.Icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
            >
              <Icon size={19} strokeWidth={1.8} className={styles.icon} />
              <span className={styles.label}>{t(item.labelKey, item.defaultLabel)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
