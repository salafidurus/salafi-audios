"use client";

import { pickContentField } from "@sd/core-i18n";
import { useScholarDetail, useScholarContent, useScholarTopics } from "@sd/domain-content";
import { ChevronLeft } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { LectureRow } from "@/features/home/components/lecture-row/lecture-row";
import { ScholarHeader } from "@/features/listing/components/scholar/scholar-header/scholar-header";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Search, type FilterChip } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

import styles from "./scholar-detail.screen.module.css";

export type ScholarDetailScreenProps = {
  slug: string;
};

function formatDuration(durationSeconds?: number): string {
  if (!durationSeconds || durationSeconds <= 0) {
    return "";
  }
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.round((durationSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }
  if (minutes <= 0) {
    return "";
  }
  return `${minutes}m`;
}

function handleBack() {
  window.history.back();
}

export function ScholarDetailScreen({ slug }: ScholarDetailScreenProps) {
  const { t } = useTranslation();
  const showOriginal = useShowOriginalContent();
  const { navigateToListing } = useListingNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const headerContentRef = useRef<HTMLDivElement>(null);

  const { data: scholar, isFetching: isFetchingScholar } = useScholarDetail(slug);
  const { data: contentData } = useScholarContent(slug);
  const { data: topicsData } = useScholarTopics(slug);

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

  const handleFollow = () => {
    console.log(`Follow scholar: ${slug}`);
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

  let rawItems = contentData?.items ?? [];
  if (selectedTopicId && topicsData?.topics) {
    const topic = topicsData.topics.find((t) => t.topicId === selectedTopicId);
    rawItems = topic?.items ?? [];
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredItems = rawItems.filter((item) => {
    if (!query) return true;
    const title = pickContentField(item.title, item.original?.title, showOriginal).toLowerCase();
    return title.includes(query);
  });

  return (
    <ScreenView>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <div ref={headerContentRef}>
            <div className={styles.backBar}>
              <button type="button" className={styles.backButton} onClick={handleBack}>
                <ChevronLeft size={15} />
                {t("scholars.backToScholars", "Back to Scholars")}
              </button>
            </div>

            <div className={styles.headerContent}>
              <ScholarHeader scholar={scholar} onFollow={handleFollow} />
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
          <div className={styles.contentList}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <LectureRow
                  key={item.id}
                  title={pickContentField(item.title, item.original?.title, showOriginal)}
                  category={item.type}
                  scholarName={scholar.name}
                  scholarSlug={scholar.slug}
                  duration={formatDuration(item.durationSeconds)}
                  totalLessons={item.lectureCount ?? 0}
                  progress={0}
                  onClick={() => navigateToListing(item.slug)}
                />
              ))
            ) : (
              <p className={styles.empty}>
                {t("scholarContent.empty", "No published content found.")}
              </p>
            )}
          </div>
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
    </ScreenView>
  );
}
