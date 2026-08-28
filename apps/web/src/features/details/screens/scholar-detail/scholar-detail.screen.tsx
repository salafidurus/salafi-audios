"use client";

import type {
  ScholarContentItemDto,
  ScholarDetailDto,
  ScholarDetailStats,
} from "@sd/core-contracts";

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
import { formatDuration } from "@/shared/utils/format";

import styles from "./scholar-detail.screen.module.css";

export type ScholarDetailScreenProps = {
  slug: string;
};

type ScholarStateProps = {
  isError: boolean;
  isFetching: boolean;
  hasScholar: boolean;
  onRetry: () => void;
  t: ReturnType<typeof useTranslation>["t"];
};

function getScholarState(isError: boolean, isFetching: boolean, hasScholar: boolean) {
  if (isError && !hasScholar) return "error" as const;
  if (isFetching && !hasScholar) return "loading" as const;
  if (!hasScholar) return "not-found" as const;
  return "ready" as const;
}

function ScholarState({ isError, isFetching, hasScholar, onRetry, t }: ScholarStateProps) {
  if (isError && !hasScholar) {
    return (
      <ScreenView center>
        <Empty className={styles.state}>
          <EmptyHeader>
            <EmptyTitle>{t("scholarContent.error", "Failed to load scholar details")}</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" onClick={onRetry}>
              {t("common.retry", "Try again")}
            </Button>
          </EmptyContent>
        </Empty>
      </ScreenView>
    );
  }
  if (isFetching && !hasScholar) {
    return <ScholarLoadingState t={t} />;
  }
  if (!hasScholar) {
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
  return null;
}

function ScholarLoadingState({ t }: { t: ScholarStateProps["t"] }) {
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

function buildTopicChips(
  topics: { topicId: string; topicName: string }[] | undefined,
): FilterChip[] {
  return (topics ?? [])
    .map((topic) => ({ id: topic.topicId, label: topic.topicName }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function selectTopicItems(
  items: ScholarContentItemDto[],
  topics: { topicId: string; items: ScholarContentItemDto[] }[] | undefined,
  selectedTopicId: string | null,
) {
  if (!selectedTopicId || !topics) return items;
  return topics.find((topic) => topic.topicId === selectedTopicId)?.items ?? [];
}

function filterTopicItems(items: ScholarContentItemDto[], query: string, showOriginal: boolean) {
  if (!query) return items;
  return items.filter((item) => {
    const title = pickContentField(item.title, item.original?.title, showOriginal).toLowerCase();
    return title.includes(query);
  });
}

function handleBack() {
  window.history.back();
}

type ScholarLoadedViewProps = {
  scholar: ScholarDetailDto & ScholarDetailStats;
  filteredItems: ScholarContentItemDto[];
  topicChips: FilterChip[];
  selectedTopicId: string | null;
  searchQuery: string;
  showOriginal: boolean;
  onSearchChange: (value: string) => void;
  onTopicChange: (topicId: string) => void;
  onNavigateToListing: (slug: string) => void;
  onFollow: () => void;
  t: ReturnType<typeof useTranslation>["t"];
};

function ScholarLoadedView({
  scholar,
  filteredItems,
  topicChips,
  selectedTopicId,
  searchQuery,
  showOriginal,
  onSearchChange,
  onTopicChange,
  onNavigateToListing,
  onFollow,
  t,
}: ScholarLoadedViewProps) {
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
          <ScholarHeader scholar={scholar} onFollow={onFollow} layout="sidebar" />
          <div className={styles.searchFilterWrapper}>
            <div className={styles.searchWrapper}>
              <Search.Bar
                value={searchQuery}
                onChange={onSearchChange}
                placeholder={t("scholarContent.searchPlaceholder", "Search scholar content…")}
              />
            </div>

            {topicChips.length > 0 && (
              <div className={styles.filterWrapper}>
                <Search.Filter
                  chips={topicChips}
                  selected={selectedTopicId ? [selectedTopicId] : []}
                  onChipChange={onTopicChange}
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
                      onClick={() => onNavigateToListing(item.slug)}
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

  const topicChips: FilterChip[] = useMemo(() => buildTopicChips(topicsData?.topics), [topicsData]);

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

  const scholarState = getScholarState(isScholarError, isFetchingScholar, Boolean(scholar));
  if (scholarState !== "ready") {
    return (
      <ScholarState
        isError={isScholarError}
        isFetching={isFetchingScholar}
        hasScholar={Boolean(scholar)}
        onRetry={() => void refetchScholar()}
        t={t}
      />
    );
  }
  if (!scholar) return null;

  const rawItems = selectTopicItems(contentData?.items ?? [], topicsData?.topics, selectedTopicId);
  const query = searchQuery.trim().toLowerCase();
  const filteredItems = filterTopicItems(rawItems, query, showOriginal);

  return (
    <ScholarLoadedView
      scholar={scholar}
      filteredItems={filteredItems}
      topicChips={topicChips}
      selectedTopicId={selectedTopicId}
      searchQuery={searchQuery}
      showOriginal={showOriginal}
      onSearchChange={setSearchQuery}
      onTopicChange={handleChipChange}
      onNavigateToListing={navigateToListing}
      onFollow={handleFollow}
      t={t}
    />
  );
}
