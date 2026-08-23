"use client";

import { pickContentField } from "@sd/core-i18n";
import { useScholarDetail, useScholarContent, useScholarTopics } from "@sd/domain-content";
import { ChevronLeft } from "lucide-react";
import { useState, useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScholarHeader } from "@/features/details/components/scholar/scholar-header/scholar-header";
import { LectureRow } from "@/features/home/components/lecture-row/lecture-row";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Search, type FilterChip } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { Button } from "@/shared/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
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

  const {
    data: scholar,
    isFetching: isFetchingScholar,
    isError: isScholarError,
    refetch: refetchScholar,
  } = useScholarDetail(slug);
  const { data: contentData } = useScholarContent(slug);
  const { data: topicsData } = useScholarTopics(slug);

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

  if (isScholarError && !scholar) {
    return (
      <ScreenView center>
        <Empty className={styles.state}>
          <EmptyHeader>
            <EmptyTitle>{t("scholarContent.error", "Failed to load scholar details")}</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" onClick={() => refetchScholar()}>
              {t("common.retry", "Try again")}
            </Button>
          </EmptyContent>
        </Empty>
      </ScreenView>
    );
  }

  if (isFetchingScholar && !scholar) {
    return (
      <ScreenView>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <div>
              <div className={styles.backBar}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={styles.backButton}
                  onClick={handleBack}
                >
                  <ChevronLeft data-icon="inline-start" />
                  {t("scholars.backToScholars", "Back to Scholars")}
                </Button>
              </div>

              <div className={styles.loadingScholar}>
                <Skeleton className={styles.loadingAvatar} />
                <div className={styles.loadingScholarText}>
                  <Skeleton className={styles.loadingName} />
                  <Skeleton className={styles.loadingStats} />
                </div>
              </div>
            </div>
          </StickyHeaderLayout.Header>

          <StickyHeaderLayout.Content>
            <div className={styles.contentList} aria-label={t("common.loading", "Loading…")}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={`scholar-detail-skeleton-${i}`} className={styles.loadingRow} />
              ))}
            </div>
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
      </ScreenView>
    );
  }

  if (!scholar) {
    return (
      <ScreenView center>
        <Empty className={styles.state}>
          <EmptyHeader>
            <EmptyTitle>{t("scholarContent.notFound", "Scholar not found")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
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
      <div className={styles.pageLayout}>
        <aside className={styles.detailsRail} aria-label={t("scholars.details", "Scholar details")}>
          <div className={styles.backBar}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={styles.backButton}
              onClick={handleBack}
            >
              <ChevronLeft data-icon="inline-start" />
              {t("scholars.backToScholars", "Back to Scholars")}
            </Button>
          </div>
          <ScholarHeader scholar={scholar} onFollow={handleFollow} layout="sidebar" />
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
        </aside>

        <main className={styles.contentColumn}>
          <StickyHeaderLayout>
            <section aria-labelledby="scholar-content-heading" className={styles.contentRegion}>
              <div className={styles.contentIntro}>
                <div>
                  <p className={styles.eyebrow}>
                    {t("scholarContent.catalogLabel", "Scholar catalog")}
                  </p>
                  <h2 id="scholar-content-heading" className={styles.contentHeading}>
                    {t("scholarContent.publishedContent", "Published content")}
                  </h2>
                </div>
                <span className={styles.contentCount}>
                  {filteredItems.length}{" "}
                  {t(
                    filteredItems.length === 1 ? "scholarContent.item" : "scholarContent.items",
                    filteredItems.length === 1 ? "item" : "items",
                  )}
                </span>
              </div>
              <Separator />

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
            </section>
          </StickyHeaderLayout>
        </main>
      </div>
    </ScreenView>
  );
}
