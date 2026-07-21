"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import clsx from "clsx";
import { useTranslation } from "@/core/i18n/use-translation";
import { routes } from "@sd/core-contracts";
import { Maximize2, Minimize2 } from "lucide-react";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { NavItems } from "./nav-items";
import { SidebarMobile } from "./sidebar.mobile";
import { useNavigationStore } from "../../store/navigation-store";
import styles from "./sidebar.module.css";

export function Sidebar() {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useResponsive();
  const {
    isDesktopSidebarCollapsed,
    toggleDesktopSidebar,
    isTabletSidebarCollapsed,
    toggleTabletSidebar,
  } = useNavigationStore();

  const collapsed = isTablet ? isTabletSidebarCollapsed : isDesktopSidebarCollapsed;
  const onToggle = isTablet ? toggleTabletSidebar : toggleDesktopSidebar;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sidebar-width", collapsed ? "4.5rem" : "16.5rem");
  }, [collapsed]);

  if (isMobile) {
    return <SidebarMobile />;
  }

  return (
    <aside
      className={clsx(styles.sidebar, collapsed && styles.collapsed)}
      aria-label={t("navigation.primarySidebar")}
      data-testid="sidebar"
      data-collapsed={collapsed}
    >
      <div className={styles.brandRow}>
        <Link
          href={routes.home}
          className={styles.brand}
          aria-label={t("navigation.siteTitle")}
          data-testid="brand-link"
        >
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
          onClick={onToggle}
          aria-label={collapsed ? t("navigation.expandSidebar") : t("navigation.collapseSidebar")}
        >
          {collapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
      </div>

      <NavItems collapsed={collapsed} />
    </aside>
  );
}
