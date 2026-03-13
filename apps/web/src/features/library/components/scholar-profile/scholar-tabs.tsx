"use client";

import styles from "./scholar-tabs.module.css";

export type TabType = "collections" | "series" | "lectures" | "biography";

interface ScholarTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  availableTabs: TabType[];
}

const tabLabels: Record<TabType, string> = {
  collections: "Collections",
  series: "Series",
  lectures: "Standalone Lectures",
  biography: "Biography",
};

export function ScholarTabs({ activeTab, onTabChange, availableTabs }: ScholarTabsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.tabList} role="tablist" aria-label="Scholar content tabs">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => onTabChange(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>
    </div>
  );
}
