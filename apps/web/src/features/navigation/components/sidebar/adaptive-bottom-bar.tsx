"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { getSubnavLabel } from "@sd/core-i18n";
import { routes } from "@sd/core-contracts";
import { Cloud, Mic, Search, CassetteTape, Settings, type LucideIcon } from "lucide-react";
import styles from "./sidebar-bottom.module.css";
import {
  DEFAULT_TABS,
  SECTION_TABS,
  SECTION_LABELS,
  type Section,
} from "@/features/navigation/types";
import { useNavigationStore } from "@/features/navigation/store/navigation-store";
import {
  buildSectionTabPath,
  getCurrentSection,
  getActiveTabFromPath,
} from "@/features/navigation/utils/get-current-section";
import { getSectionTabIcon } from "@/features/navigation/utils/section-tab-icons";

const SECTION_ICONS: Record<Section, LucideIcon> = {
  feed: Cloud,
  live: Mic,
  library: CassetteTape,
  settings: Settings,
};

const SECTION_ORDER: Section[] = ["feed", "live", "library", "settings"];

export function AdaptiveBottomBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const sectionTabs = useNavigationStore((s) => s.sectionTabs);
  const setActiveTab = useNavigationStore((s) => s.setActiveTab);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentSection = getCurrentSection(pathname);
  const isHub = currentSection === "home";

  // Sync active tab from URL
  useEffect(() => {
    if (currentSection !== "home") {
      setActiveTab(currentSection, getActiveTabFromPath(pathname) ?? DEFAULT_TABS[currentSection]);
    }
  }, [pathname, currentSection, setActiveTab]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [menuOpen]);

  if (isHub) {
    return (
      <aside className={styles.sidebar} aria-label="Primary navigation">
        <nav className={clsx(styles.nav, styles.hubNav)} aria-label="Main">
          {SECTION_ORDER.map((section) => {
            const Icon = SECTION_ICONS[section];
            const tab = sectionTabs[section];
            const href = buildSectionTabPath(section, tab);
            return (
              <Link
                key={section}
                href={href}
                className={styles.link}
                aria-label={`Navigate to ${SECTION_LABELS[section]}`}
              >
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span>{SECTION_LABELS[section]}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  const SectionIcon = SECTION_ICONS[currentSection];
  const tabs = SECTION_TABS[currentSection];
  const activeTab = sectionTabs[currentSection];

  return (
    <aside className={styles.sidebar} aria-label="Primary navigation">
      <nav className={clsx(styles.nav, styles.sectionNav)} aria-label="Main">
        <div className={styles.sectionIconWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.sectionIcon}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={`Switch from ${SECTION_LABELS[currentSection]}`}
          >
            <SectionIcon size={18} />
          </button>
          {menuOpen && (
            <div className={styles.sectionMenu}>
              <Link
                href={routes.home}
                className={styles.sectionMenuItem}
                onClick={() => setMenuOpen(false)}
              >
                <Search size={16} />
                <span>Home</span>
              </Link>
              {SECTION_ORDER.map((section) => {
                const Icon = SECTION_ICONS[section];
                const tab = sectionTabs[section];
                const href = buildSectionTabPath(section, tab);
                return (
                  <Link
                    key={section}
                    href={href}
                    className={clsx(
                      styles.sectionMenuItem,
                      section === currentSection && styles.sectionMenuItemActive,
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon size={16} />
                    <span>{SECTION_LABELS[section]}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.tabGroup} role="tablist">
          {tabs.map((tab) => {
            const tabPath = buildSectionTabPath(currentSection, tab.id);
            const isActive = tab.id === activeTab;
            return (
              <Link
                key={tab.id}
                href={tabPath}
                className={clsx(styles.tab, isActive && styles.tabActive)}
                role="tab"
                aria-selected={isActive}
              >
                {getSectionTabIcon(currentSection, tab.id) &&
                  (() => {
                    const TabIcon = getSectionTabIcon(currentSection, tab.id);
                    if (!TabIcon) {
                      return null;
                    }
                    return <TabIcon size={14} />;
                  })()}
                {getSubnavLabel(currentSection, tab.id, t)}
              </Link>
            );
          })}
        </div>

        <Link href={routes.search} className={styles.searchBtn} aria-label="Open search">
          <Search size={18} />
        </Link>
      </nav>
    </aside>
  );
}
