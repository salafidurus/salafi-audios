"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useTranslation } from "@/core/i18n/use-translation";
import { getSubnavLabel } from "@sd/core-i18n";
import { DEFAULT_TABS, SECTION_TABS } from "@/features/navigation/types";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useIsHydrated } from "@/shared/hooks/use-is-hydrated";
import {
  buildSectionTabPath,
  getActiveTabFromPath,
  getCurrentSection,
} from "@/features/navigation/utils/get-current-section";
import { getSectionTabIcon } from "@/features/navigation/utils/section-tab-icons";
import styles from "./top-subnav-tabs.module.css";

/**
 * Sticky horizontal subsection tabs shown below the TopAuthStrip on desktop.
 * On tablet/mobile the bottom bar handles subsection navigation, so this
 * renders nothing.
 */
export function TopSubnavTabs() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isHydrated = useIsHydrated();
  const { isMobile, isTablet } = useResponsive();

  const section = getCurrentSection(pathname);

  if (!isHydrated || isMobile || isTablet || section === "home") {
    return null;
  }

  const tabs = SECTION_TABS[section];
  const activeTabId = getActiveTabFromPath(pathname) ?? DEFAULT_TABS[section];

  return (
    <nav className={styles.tabsContainer} role="tablist" aria-label={t("navigation.mainNav")}>
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
    </nav>
  );
}
