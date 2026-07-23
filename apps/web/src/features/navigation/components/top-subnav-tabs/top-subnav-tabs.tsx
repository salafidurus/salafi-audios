"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useTranslation } from "@/core/i18n/use-translation";
import { getSubnavLabel } from "@sd/core-i18n";
import { DEFAULT_TABS, SECTION_TABS } from "@/features/navigation/types";
import { useIsHydrated } from "@/shared/hooks/use-is-hydrated";
import { useAdminPermissions } from "@sd/domain-account";
import { useAuth } from "@/core/auth/use-auth";
import {
  buildSectionTabPath,
  getActiveTabFromPath,
  getCurrentSection,
} from "@/features/navigation/utils/get-current-section";
import { getSectionTabIcon } from "@/features/navigation/utils/section-tab-icons";
import styles from "./top-subnav-tabs.module.css";

/**
 * Sticky horizontal subsection tabs shown below the TopAuthStrip on all screen sizes.
 * On mobile, tabs are horizontally scrollable and hidden behind the mobile header.
 */
export function TopSubnavTabs() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isHydrated = useIsHydrated();
  const { isAuthenticated } = useAuth();
  const { data: adminPermissionsData } = useAdminPermissions({ isAuthenticated });

  const section = getCurrentSection(pathname);
  const hasAdminAccess =
    adminPermissionsData && (adminPermissionsData.permissions ?? []).length > 0;

  const isAdminSection = section === "adminContents";

  // Show tabs on all screen sizes (responsive CSS handles mobile styling)
  // Hide tabs for admin section if user doesn't have admin permissions
  if (!isHydrated || section === "home" || (isAdminSection && !hasAdminAccess)) {
    return null;
  }

  const tabs = SECTION_TABS[section];
  const activeTabId = getActiveTabFromPath(pathname) ?? DEFAULT_TABS[section];

  return (
    <nav className={styles.tabsContainer} role="tablist" aria-label={t("navigation.mainNav")}>
      <div className={styles.inner}>
        {tabs.map((tab) => {
          const tabPath = buildSectionTabPath(section, tab.id);
          const isActive = tab.id === activeTabId;
          const TabIcon = getSectionTabIcon(section, tab.id);
          return (
            <Link
              key={tab.id}
              href={tabPath}
              className={clsx(styles.tabLink, isActive && styles.activeTab)}
              role="tab"
              aria-selected={isActive}
            >
              {TabIcon ? <TabIcon size={14} /> : null}
              {getSubnavLabel(section, tab.id, t)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
