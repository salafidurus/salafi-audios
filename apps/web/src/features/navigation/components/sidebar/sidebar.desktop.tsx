"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useTranslation } from "@/core/i18n/use-translation";
import { routes } from "@sd/core-contracts";
import {
  PanelLeftOpen,
  PanelRightOpen,
  Cloud,
  Mic,
  CassetteTape,
  Settings,
  type LucideIcon,
} from "lucide-react";
import styles from "./sidebar.module.css";

type NavItem = {
  label: string;
  Icon: LucideIcon;
  href: string;
  activeMatch: string;
};

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const accountHref = routes.account.index;

  const navItems: NavItem[] = [
    {
      label: t("navigation.feeds"),
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
      label: t("navigation.lessons"),
      Icon: CassetteTape,
      href: routes.library.index,
      activeMatch: routes.library.index,
    },
  ];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sidebar-width", collapsed ? "4.5rem" : "16.5rem");
  }, [collapsed]);

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
          <span className={styles.label}>{t("navigation.account")}</span>
        </Link>
      </nav>
    </aside>
  );
}
