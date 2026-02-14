"use client";

import { useMemo, useState } from "react";
import { Clock3, Home, Layers, TrendingUp } from "lucide-react";
import type { Tab } from "@/features/home/types/home.types";
import { RecommendationRow } from "@/features/home/components/recommendations/row/row";
import styles from "./tabs.module.css";

const tabIcons = {
  home: Home,
  latest: Clock3,
  trending: TrendingUp,
  series: Layers,
} as const;

type TabsProps = {
  tabs: Tab[];
  defaultTabId?: Tab["id"];
};

export function Tabs({ tabs, defaultTabId }: TabsProps) {
  const initialTabId = defaultTabId ?? tabs[0]?.id ?? "home";
  const [activeTabId, setActiveTabId] = useState(initialTabId);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [activeTabId, tabs],
  );

  if (!activeTab) {
    return null;
  }

  return (
    <section className={styles.contentNav} aria-label="Home content navigation">
      <div className={styles.tabs} role="tablist" aria-label="Home content tabs">
        {tabs.map((tab) => {
          const Icon = tabIcons[tab.id as keyof typeof tabIcons] ?? Home;
          const isActive = tab.id === activeTab.id;

          return (
            <button
              key={tab.id}
              id={`recommendations-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`recommendations-panel-${tab.id}`}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span className={styles.tabIcon} aria-hidden="true">
                <Icon size={16} aria-hidden="true" />
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={`recommendations-panel-${activeTab.id}`}
        role="tabpanel"
        aria-labelledby={`recommendations-tab-${activeTab.id}`}
        className={styles.panel}
      >
        {activeTab.rows.length === 0 ? (
          <div className={styles.emptyState}>No recommendations yet.</div>
        ) : (
          activeTab.rows.map((row) => (
            <RecommendationRow key={row.id} title={row.title} items={row.items} />
          ))
        )}
      </div>
    </section>
  );
}
