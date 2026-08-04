"use client";

import { routes } from "@sd/core-contracts";
import { BookOpen } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { useResponsive } from "@/shared/hooks/use-responsive";

import { NavItems } from "./nav-items";
import { SidebarMobile } from "./sidebar.mobile";
import styles from "./sidebar.module.css";

export function Sidebar() {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  if (isMobile) {
    return <SidebarMobile />;
  }

  return (
    <aside
      className={styles.sidebar}
      aria-label={t("navigation.primarySidebar")}
      data-testid="sidebar"
    >
      <div className={styles.brandRow}>
        <Link
          href={routes.home}
          className={styles.brand}
          aria-label={t("navigation.siteTitle")}
          data-testid="brand-link"
        >
          <span className={styles.brandMark} aria-hidden="true">
            <BookOpen size={17} color="currentColor" strokeWidth={1.8} />
          </span>
          <span className={styles.brandText}>{t("navigation.siteTitle")}</span>
        </Link>
      </div>

      <NavItems />
    </aside>
  );
}
