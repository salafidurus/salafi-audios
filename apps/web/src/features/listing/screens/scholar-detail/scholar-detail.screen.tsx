"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useScholarDetail, useScholarContent, useScholarTopics } from "@sd/domain-content";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { AppText } from "@/shared/components/AppText/AppText";
import { Search, type FilterChip } from "@/shared/components/Search";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScholarHeader } from "@/features/listing/components/scholar/scholar-header/scholar-header";
import { ScholarContentList } from "@/features/listing/components/scholar/scholar-content-list/scholar-content-list";
import styles from "./scholar-detail.screen.module.css";

export type ScholarDetailScreenProps = {
  slug: string;
};

export function ScholarDetailScreen({ slug }: ScholarDetailScreenProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const headerContentRef = useRef<HTMLDivElement>(null);

  const { data: scholar, isFetching: isFetchingScholar } = useScholarDetail(slug);
  const { data: contentData } = useScholarContent(slug);
  const { data: topicsData } = useScholarTopics(slug);

  // Measure sticky header height dynamically for scroll offset
  useEffect(() => {
    const el = headerContentRef.current;
    if (!el) return;

    const updateHeight = () => {
      const stickyHeaderEl = el.closest('[class*="stickyHeader"]') as HTMLElement | null;
      const height = stickyHeaderEl
        ? stickyHeaderEl.getBoundingClientRect().height
        : el.getBoundingClientRect().height + 32;
      document.documentElement.style.setProperty("--sticky-header-height", `${height}px`);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, [scholar, contentData, topicsData]);

  // Topic filter chips derived from scholar topics
  const topicChips: FilterChip[] = useMemo(() => {
    if (!topicsData?.topics) return [];
    return topicsData.topics
      .map((t) => ({ id: t.topicId, label: t.topicName }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [topicsData]);

  const handleChipChange = (topicId: string) => {
    if (topicId === "all") {
      setSelectedTopicId(null);
    } else {
      setSelectedTopicId((prev) => (prev === topicId ? null : topicId));
    }
  };

  if (isFetchingScholar && !scholar) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">{t("scholarContent.loading", "Loading scholar…")}</AppText>
      </ScreenView>
    );
  }

  if (!scholar) {
    return (
      <ScreenView center>
        <AppText variant="titleMd">{t("scholarContent.notFound", "Scholar not found")}</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <div ref={headerContentRef}>
            <div className={styles.headerTopRow}>
              <ScholarHeader scholar={scholar} />
            </div>

            <div className={styles.searchFilterWrapper}>
              <div className={styles.searchWrapper}>
                <Search.Bar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={t("scholarContent.searchPlaceholder", "Search scholar content…")}
                />
              </div>

              {topicChips.length > 0 && (
                <div className={styles.filterWrapper}>
                  <Search.Filter
                    chips={topicChips}
                    selected={selectedTopicId ? [selectedTopicId] : []}
                    onChipChange={handleChipChange}
                    includeAllOption
                  />
                </div>
              )}
            </div>
          </div>
        </StickyHeaderLayout.Header>

        <StickyHeaderLayout.Content>
          <div className={styles.contentWrapper}>
            <ScholarContentList
              slug={slug}
              searchQuery={searchQuery}
              selectedTopicId={selectedTopicId}
              scholarImageUrl={scholar.imageUrl ?? undefined}
            />
          </div>
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
    </ScreenView>
  );
}
