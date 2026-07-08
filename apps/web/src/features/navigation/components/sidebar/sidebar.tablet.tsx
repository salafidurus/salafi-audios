"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import clsx from "clsx";
import { useTranslation } from "@/core/i18n/use-translation";
import { routes } from "@sd/core-contracts";
import { ChevronRight } from "lucide-react";
import { NavItems } from "./nav-items";
import { useNavigationStore } from "../../store/navigation-store";
import styles from "./sidebar.module.css";

export function SidebarTablet() {
  const { t } = useTranslation();
  const { isTabletSidebarCollapsed, toggleTabletSidebar } = useNavigationStore();

  // Update CSS variable for width
  useEffect(() => {
    const root = document.documentElement;
    const width = isTabletSidebarCollapsed ? "4.5rem" : "16.5rem";
    root.style.setProperty("--sidebar-width", width);
  }, [isTabletSidebarCollapsed]);

  return (
    <aside
      className={clsx(styles.sidebar, isTabletSidebarCollapsed && styles.collapsed)}
      aria-label={t("navigation.primarySidebar")}
      data-collapsed={isTabletSidebarCollapsed}
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
          onClick={toggleTabletSidebar}
          aria-label={
            isTabletSidebarCollapsed
              ? t("navigation.expandSidebar")
              : t("navigation.collapseSidebar")
          }
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <NavItems collapsed={isTabletSidebarCollapsed} />
    </aside>
  );
}
