"use client";

import { useState, useId, useCallback } from "react";
import { CardGrid } from "@/features/library/components/cards/grid/grid";
import { EntityCard } from "@/features/library/components/cards/entity/entity-card";
import { EmptyState } from "@/features/library/components/states/empty-state/empty-state";
import styles from "./scholar-tabs.module.css";

type CollectionItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language?: string;
  coverImageUrl?: string;
  publishedLectureCount?: number;
};

type SeriesItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language?: string;
  coverImageUrl?: string;
  publishedLectureCount?: number;
};

type ScholarTabsProps = {
  scholarSlug: string;
  collections: CollectionItem[];
  seriesInCollections: SeriesItem[];
  standaloneSeries: SeriesItem[];
  /** When true, only tab list + panels are rendered (no two-column, no sidebar). */
  embedded?: boolean;
  /** When provided with embedded, tabs are controlled by parent. */
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
};

type TabId = "collections" | "series" | "lectures";

const TABS: { id: TabId; label: string }[] = [
  { id: "collections", label: "Collections" },
  { id: "series", label: "Series" },
  { id: "lectures", label: "Lectures" },
];

export function ScholarTabs({
  scholarSlug,
  collections,
  seriesInCollections,
  standaloneSeries,
  embedded = false,
  activeTab: controlledTab,
  onTabChange,
}: ScholarTabsProps) {
  const [internalTab, setInternalTab] = useState<TabId>("collections");
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = onTabChange ?? setInternalTab;
  const idPrefix = useId();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const idx = TABS.findIndex((t) => t.id === activeTab);
      if (idx < 0) return;
      const nextIdx =
        e.key === "ArrowLeft" ? Math.max(0, idx - 1) : Math.min(TABS.length - 1, idx + 1);
      setActiveTab(TABS[nextIdx]!.id);
    },
    [activeTab, setActiveTab],
  );

  const tabContent = (
    <div className={styles.wrapper}>
      <div
        className={styles.tabList}
        role="tablist"
        aria-label="Scholar content"
        onKeyDown={handleKeyDown}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            className={activeTab === tab.id ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`${idPrefix}-panel-collections`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-collections`}
        hidden={activeTab !== "collections"}
        className={styles.panel}
      >
        {collections.length === 0 ? (
          <EmptyState message="This scholar has no published collections." />
        ) : (
          <CardGrid>
            {collections.map((collection) => (
              <EntityCard
                key={collection.id}
                href={`/collections/${scholarSlug}/${collection.slug}`}
                title={collection.title}
                description={collection.description}
                meta={
                  collection.publishedLectureCount != null
                    ? `${collection.publishedLectureCount} lectures`
                    : collection.language
                }
                coverImageUrl={collection.coverImageUrl}
                tag={collection.language}
              />
            ))}
          </CardGrid>
        )}
      </div>

      <div
        id={`${idPrefix}-panel-series`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-series`}
        hidden={activeTab !== "series"}
        className={styles.panel}
      >
        {seriesInCollections.length === 0 ? (
          <EmptyState message="No series in collections." />
        ) : (
          <CardGrid>
            {seriesInCollections.map((series) => (
              <EntityCard
                key={series.id}
                href={`/series/${scholarSlug}/${series.slug}`}
                title={series.title}
                description={series.description}
                meta={
                  series.publishedLectureCount != null
                    ? `${series.publishedLectureCount} lessons`
                    : series.language
                }
                coverImageUrl={series.coverImageUrl}
                tag={series.language}
              />
            ))}
          </CardGrid>
        )}
      </div>

      <div
        id={`${idPrefix}-panel-lectures`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-lectures`}
        hidden={activeTab !== "lectures"}
        className={styles.panel}
      >
        {standaloneSeries.length === 0 ? (
          <EmptyState message="This scholar has no standalone published lectures." />
        ) : (
          <CardGrid>
            {standaloneSeries.map((series) => (
              <EntityCard
                key={series.id}
                href={`/series/${scholarSlug}/${series.slug}`}
                title={series.title}
                description={series.description}
                meta={
                  series.publishedLectureCount != null
                    ? `${series.publishedLectureCount} lessons`
                    : series.language
                }
                coverImageUrl={series.coverImageUrl}
                tag={series.language}
              />
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return tabContent;
  }

  return (
    <div className={styles.twoColumn}>
      <div className={styles.mainColumn}>{tabContent}</div>
      <aside className={styles.sidebar} aria-label="In this library">
        <h2 className={styles.sidebarTitle}>In this library</h2>
        <nav className={styles.sidebarNav}>
          <button
            type="button"
            className={activeTab === "collections" ? styles.sidebarLinkActive : styles.sidebarLink}
            onClick={() => setActiveTab("collections")}
          >
            Collections
          </button>
          <button
            type="button"
            className={activeTab === "series" ? styles.sidebarLinkActive : styles.sidebarLink}
            onClick={() => setActiveTab("series")}
          >
            Series
          </button>
          <button
            type="button"
            className={activeTab === "lectures" ? styles.sidebarLinkActive : styles.sidebarLink}
            onClick={() => setActiveTab("lectures")}
          >
            Lectures
          </button>
        </nav>
      </aside>
    </div>
  );
}
