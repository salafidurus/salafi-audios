"use client";

import { routes, type FeedContentItemDto } from "@sd/core-contracts";
import { getErrorStateText, getLocalizedName } from "@sd/core-i18n";
import { useAudio, useProgressStore } from "@sd/domain-audio";
import { useExploreRecentScreen, useScholarsList } from "@sd/domain-content";
import { useInfiniteSearch, useTopicsList } from "@sd/domain-search";
import { useRouter } from "next/navigation";
import React, { useRef, useEffect, useState, useMemo, type ReactNode } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { useToast } from "@/core/toast";
import { audioService, usePlayListing } from "@/features/audio";
import { LectureCard } from "@/features/home/components/lecture-card/lecture-card";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { Search } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { useDebouncedSearch } from "@/shared/hooks";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";
import { useResponsive } from "@/shared/hooks/use-responsive";

import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { FeedSkeleton } from "../components/feed-skeleton/feed-skeleton";
import { FeedTopicRow } from "../components/feed-topic-row/feed-topic-row";
import { FilterSelect } from "../components/filter-select/filter-select";
import styles from "./explore-recent.screen.module.css";

export type FeedRecentScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function formatDuration(durationSeconds?: number | null): string {
  if (!durationSeconds || durationSeconds <= 0) return "";
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.round((durationSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function FeedGridItemCard({
  item,
  onNavigate,
}: {
  item: {
    id: string;
    slug: string;
    title: string;
    kind: string;
    scholarName: string;
    scholarSlug?: string;
    thumbnailUrl?: string | null;
    durationSeconds?: number | null;
    publishedLectureCount?: number;
    lectureCount?: number;
  };
  onNavigate?: (slug: string) => void;
}) {
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);
  const { addToast } = useToast();
  const { isPlaying, currentTrack } = useAudio();

  const isCurrentTrack =
    currentTrack?.id === item.id ||
    currentTrack?.seriesId === item.id ||
    currentTrack?.collectionId === item.id;

  const { play } = usePlayListing(
    {
      id: item.id,
      slug: item.slug,
      title: item.title,
      // SAFETY: feed cards are built only from listing-format content rows, never scholar/topic rows.
      format: item.kind as "single" | "series" | "collection",
      scholarName,
      scholarSlug: item.scholarSlug,
      artworkUrl: item.thumbnailUrl ?? undefined,
    },
    { onError: (message) => addToast(message, "error") },
  );

  const progress = useProgressStore((s) => s.progressMap[item.id]);
  const progressPercent =
    progress && progress.durationSeconds
      ? Math.min(Math.max((progress.positionSeconds / progress.durationSeconds) * 100, 0), 100)
      : 0;

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      if (isPlaying) {
        await audioService.pause();
      } else {
        await audioService.resume();
      }
      return;
    }
    await play();
  };

  const totalLessons =
    item.publishedLectureCount ?? item.lectureCount ?? (item.kind === "single" ? 1 : 1);

  return (
    <LectureCard
      title={item.title}
      category={item.kind}
      scholarName={item.scholarName}
      scholarSlug={item.scholarSlug}
      duration={formatDuration(item.durationSeconds)}
      totalLessons={totalLessons}
      progress={progressPercent / 100}
      isPlaying={isCurrentTrack && isPlaying}
      onClick={() => onNavigate?.(item.slug)}
      onPlay={handlePlay}
    />
  );
}

export function FeedRecentScreen({
  onNavigateToListing,
  onNavigateToScholar,
}: FeedRecentScreenProps) {
  const { isMobile } = useResponsive();
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();
  const handleNavigateToListing = onNavigateToListing ?? navigateToListing;
  const handleNavigateToScholar =
    onNavigateToScholar ?? ((slug) => router.push(routes.scholars.detail(slug)));

  // Search & Filtering State
  const { query, setQuery, debouncedQuery } = useDebouncedSearch();
  const [selectedScholar, setSelectedScholar] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");

  // Fetch Metadata for Filters
  const { data: scholarsData } = useScholarsList();
  const { data: topics = [] } = useTopicsList();

  const scholarChips = useMemo(() => {
    return (scholarsData?.scholars ?? []).map((s) => ({
      id: s.slug,
      label: s.name,
    }));
  }, [scholarsData]);

  const topicChips = useMemo(() => {
    return topics
      .toSorted((a, b) =>
        getLocalizedName(a.name, i18n.language).localeCompare(
          getLocalizedName(b.name, i18n.language),
        ),
      )
      .map((topic) => ({
        id: topic.slug,
        label: getLocalizedName(topic.name, i18n.language),
      }));
  }, [topics, i18n.language]);

  const formatChips = useMemo(
    () => [
      { id: "single", label: t("explore.formatSingle", "Single Lectures") },
      { id: "series", label: t("explore.formatSeries", "Series") },
      { id: "collection", label: t("explore.formatCollection", "Collections") },
    ],
    [t],
  );

  const hasActiveFilterOrSearch =
    !!debouncedQuery.trim() || !!selectedScholar || !!selectedTopic || !!selectedFormat;

  // Recent feed data (default)
  const {
    data: recentData,
    isFetching: isRecentFetching,
    isError: isRecentError,
    hasNextPage: hasRecentNextPage,
    fetchNextPage: fetchRecentNextPage,
    refetch: refetchRecent,
  } = useExploreRecentScreen();

  // Filtered search query data
  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useInfiniteSearch({
    query: debouncedQuery,
    scholarSlug: selectedScholar || undefined,
    topicSlugs: selectedTopic ? [selectedTopic] : undefined,
    format: selectedFormat || undefined,
    enabled: hasActiveFilterOrSearch,
  });

  const recentItems = recentData?.pages.flatMap((p) => p.items) ?? [];
  const searchItems = searchData?.pages.flatMap((p) => p.items) ?? [];
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasActiveFilterOrSearch || !hasRecentNextPage || isRecentFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchRecentNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasActiveFilterOrSearch, hasRecentNextPage, isRecentFetching, fetchRecentNextPage]);

  let body: ReactNode;
  const feedTitle = isMobile
    ? t("explore.recentTitleMobile", "Listings")
    : t("explore.recentTitleWide", "Listings Catalog");

  if (hasActiveFilterOrSearch) {
    if (isSearchError) {
      body = (
        <div className={styles.state} role="alert">
          <span>{getErrorStateText("feed", t)}</span>
          <button
            type="button"
            className={`${styles.button} ${styles.retryButton}`}
            onClick={() => refetchSearch()}
          >
            {t("feed.retry", "Try Again")}
          </button>
        </div>
      );
    } else if (isSearchLoading) {
      body = <FeedSkeleton />;
    } else if (searchItems.length === 0) {
      body = (
        <p className={styles.empty}>
          {t("explore.noContent", "No listings found matching your filters.")}
        </p>
      );
    } else {
      body = (
        <div className={styles.grid}>
          {searchItems.map((item) => (
            <FeedGridItemCard
              key={item.id}
              item={{
                id: item.id,
                slug: item.slug,
                title: item.title,
                kind: item.format,
                scholarName: item.scholarName,
                scholarSlug: item.scholarSlug,
                thumbnailUrl: item.imageUrl,
                durationSeconds: item.durationSeconds,
                publishedLectureCount: item.lectureCount,
              }}
              onNavigate={handleNavigateToListing}
            />
          ))}
        </div>
      );
    }
  } else if (isRecentError && recentItems.length === 0) {
    body = (
      <div className={styles.state} role="alert">
        <span>{getErrorStateText("feed", t)}</span>
        <button
          type="button"
          className={`${styles.button} ${styles.retryButton}`}
          onClick={() => refetchRecent()}
        >
          {t("feed.retry", "Try Again")}
        </button>
      </div>
    );
  } else if (isRecentFetching && recentItems.length === 0) {
    body = <FeedSkeleton />;
  } else if (recentItems.length === 0) {
    body = (
      <p className={styles.empty}>{t("explore.noContent", "No content yet. Check back soon.")}</p>
    );
  } else {
    // Render Recent items using Grid Cards!
    let cards: { key: string; node: ReactNode }[] = [];
    const blocks: ReactNode[] = [];

    const flushGrid = () => {
      if (cards.length === 0) return;
      const firstKey = cards[0]?.key ?? "grid";
      blocks.push(
        <div key={`grid-${firstKey}`} className={styles.grid}>
          {cards.map((card) => card.node)}
        </div>,
      );
      cards = [];
    };

    recentItems.forEach((item) => {
      if (item.kind === "scholar_row") {
        flushGrid();
        const rowKey = item.scholars[0]?.slug ?? "scholars";
        blocks.push(
          <section className={styles.section} key={`scholar-row-${rowKey}`}>
            <FeedScholarRow scholars={item.scholars} onScholarPress={handleNavigateToScholar} />
          </section>,
        );
      } else if (item.kind === "topic_row") {
        flushGrid();
        blocks.push(
          <section className={styles.section} key={`topic-row-${item.topicName}`}>
            <FeedTopicRow
              topicName={item.topicName}
              items={item.items}
              onItemPress={handleNavigateToListing}
            />
          </section>,
        );
      } else {
        // SAFETY: the non-row branch excludes `scholar_row` and `topic_row`, leaving only listing content items.
        const feedContentItem = item as FeedContentItemDto;
        cards.push({
          key: feedContentItem.id,
          node: (
            <FeedGridItemCard
              key={feedContentItem.id}
              item={{
                id: feedContentItem.id,
                slug: feedContentItem.slug,
                title: feedContentItem.title,
                kind: feedContentItem.kind,
                scholarName: feedContentItem.scholarName,
                scholarSlug: feedContentItem.scholarSlug,
                thumbnailUrl: feedContentItem.thumbnailUrl,
                durationSeconds: feedContentItem.durationSeconds,
                publishedLectureCount: feedContentItem.publishedLectureCount,
              }}
              onNavigate={handleNavigateToListing}
            />
          ),
        });
      }
    });

    flushGrid();

    body = (
      <>
        {blocks}
        <div ref={loadMoreRef} style={{ height: "20px" }} />
      </>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <PageHeader title={feedTitle} />
          <div className={styles.searchContainer}>
            <Search.Bar
              placeholder={t("search.placeholder", "Search lectures, scholars, or topics...")}
              value={query}
              onChange={setQuery}
            />
            <div className={styles.filterBar}>
              {scholarChips.length > 0 && (
                <FilterSelect
                  label={t("search.filterScholar", "Scholar:")}
                  options={scholarChips}
                  value={selectedScholar}
                  onChange={setSelectedScholar}
                  searchable
                />
              )}
              {topicChips.length > 0 && (
                <FilterSelect
                  label={t("search.filterTopic", "Topic:")}
                  options={topicChips}
                  value={selectedTopic}
                  onChange={setSelectedTopic}
                  searchable
                />
              )}
              <FilterSelect
                label={t("search.filterFormat", "Format:")}
                options={formatChips}
                value={selectedFormat}
                onChange={setSelectedFormat}
              />
            </div>
          </div>
        </StickyHeaderLayout.Header>
        <StickyHeaderLayout.Content>
          <div className={styles.page}>{body}</div>
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
      <ScrollToTopButton />
    </ScreenView>
  );
}
