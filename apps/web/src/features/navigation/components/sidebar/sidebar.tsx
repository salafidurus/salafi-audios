/** Provides the desktop navigation shell and delegates mobile rendering to `SidebarMobile`. */
"use client";

import { routes } from "@sd/core-contracts";
import Image from "next/image";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { useResponsive } from "@/shared/hooks/use-responsive";

import { NavItems } from "./nav-items";
import { SidebarMobile } from "./sidebar.mobile";
import styles from "./sidebar.module.css";

/** Renders the responsive sidebar when the current viewport is not mobile. */
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
            <Image
              src="/logo/logo_72.png"
              alt=""
              width={24}
              height={24}
              priority
              style={{ objectFit: "contain" }}
            />
          </span>
          <span className={styles.brandText}>{t("navigation.siteTitle")}</span>
        </Link>
      </div>

      <NavItems />
    </aside>
  );
}
