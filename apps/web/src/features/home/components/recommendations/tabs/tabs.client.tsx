"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, Home, Layers, TrendingUp } from "lucide-react";
import type { Tab } from "@/features/home/types/home.types";
import type { RecommendationItem as ApiRecommendationItem } from "@/features/home/api/public-api";
import { publicApi } from "@/features/home/api/public-api";
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

type RowState = {
  items: Tab["rows"][number]["items"];
  nextCursor?: string;
  isLoading: boolean;
  source?: Tab["rows"][number]["source"];
  visibleCount: number;
  pageSize: number;
};

function buildRecommendationHref(item: ApiRecommendationItem): string {
  if (!item.scholarSlug) return "/";

  if (item.kind === "lecture") {
    return `/lectures/${item.scholarSlug}/${item.entitySlug}`;
  }

  if (item.kind === "series") {
    return `/series/${item.scholarSlug}/${item.entitySlug}`;
  }

  return `/collections/${item.scholarSlug}/${item.entitySlug}`;
}

function mapRecommendationItem(item: ApiRecommendationItem): Tab["rows"][number]["items"][number] {
  return {
    id: item.entityId,
    kind: item.kind,
    title: item.title,
    subtitle: item.scholarName,
    href: buildRecommendationHref(item),
    coverImageUrl: item.coverImageUrl ?? undefined,
    lessonCount: item.lessonCount ?? undefined,
    totalDurationSeconds: item.totalDurationSeconds ?? undefined,
  };
}

export function Tabs({ tabs, defaultTabId }: TabsProps) {
  const initialTabId = defaultTabId ?? tabs[0]?.id ?? "home";
  const [activeTabId, setActiveTabId] = useState(initialTabId);

  const [rowState, setRowState] = useState<Record<string, RowState>>({});

  useEffect(() => {
    const nextState: Record<string, RowState> = {};
    tabs.forEach((tab) => {
      tab.rows.forEach((row) => {
        const baseCount = row.variant === "featured" ? 2 : 6;
        nextState[row.id] = {
          items: row.items,
          nextCursor: row.cursor,
          isLoading: false,
          source: row.source,
          visibleCount: Math.max(baseCount, row.items.length > 0 ? baseCount : 0),
          pageSize: baseCount,
        };
      });
    });
    setRowState(nextState);
  }, [tabs]);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [activeTabId, tabs],
  );

  if (!activeTab) {
    return null;
  }

  const loadMore = useCallback(
    async (rowId: string) => {
      const current = rowState[rowId];
      if (!current || current.isLoading) return;

      const pageSize = current.source?.kind === "kibar" ? 8 : current.pageSize;
      const hasLocalMore = current.visibleCount < current.items.length;
      const hasRemoteMore = Boolean(current.source && current.nextCursor);
      if (!hasLocalMore && !hasRemoteMore) return;

      setRowState((prev) => ({
        ...prev,
        [rowId]: { ...prev[rowId], isLoading: true },
      }));

      try {
        if (hasLocalMore) {
          setRowState((prev) => ({
            ...prev,
            [rowId]: {
              ...prev[rowId],
              visibleCount: Math.min(prev[rowId].visibleCount + pageSize, prev[rowId].items.length),
              isLoading: false,
            },
          }));
          return;
        }

        if (current.source?.kind === "kibar" && current.nextCursor) {
          const page = await publicApi.listRecommendationKibar(pageSize, current.nextCursor, {
            cache: "no-store",
          });
          setRowState((prev) => ({
            ...prev,
            [rowId]: {
              ...prev[rowId],
              items: [...prev[rowId].items, ...page.items.map(mapRecommendationItem)],
              nextCursor: page.nextCursor ?? undefined,
              visibleCount: prev[rowId].visibleCount + page.items.length,
              isLoading: false,
            },
          }));
          return;
        }

        if (current.source?.kind === "topic" && current.nextCursor) {
          const page = await publicApi.listRecommendationTopic(
            current.source.topicSlug,
            pageSize,
            current.nextCursor,
            { cache: "no-store" },
          );
          setRowState((prev) => ({
            ...prev,
            [rowId]: {
              ...prev[rowId],
              items: [...prev[rowId].items, ...page.items.map(mapRecommendationItem)],
              nextCursor: page.nextCursor ?? undefined,
              visibleCount: prev[rowId].visibleCount + page.items.length,
              isLoading: false,
            },
          }));
        }
      } catch {
        setRowState((prev) => ({
          ...prev,
          [rowId]: { ...prev[rowId], isLoading: false },
        }));
      }
    },
    [rowState],
  );

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
          activeTab.rows.map((row) => {
            const state = rowState[row.id];
            const items = state?.items ?? row.items;
            const visibleCount = state?.visibleCount ?? items.length;
            const visibleItems = items.slice(0, visibleCount);
            const hasMore =
              Boolean(state?.nextCursor) ||
              (state ? state.visibleCount < state.items.length : false);
            const isLoading = state?.isLoading ?? false;

            return (
              <RecommendationRow
                key={row.id}
                title={row.title}
                items={visibleItems}
                variant={row.variant}
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={() => loadMore(row.id)}
                pageSize={row.variant === "featured" ? 2 : 6}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
