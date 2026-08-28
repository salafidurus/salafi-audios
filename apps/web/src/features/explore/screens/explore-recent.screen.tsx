"use client";

import { routes, type FeedContentItemDto, type FeedItemDto } from "@sd/core-contracts";
import { getErrorStateText, getLocalizedName } from "@sd/core-i18n";
import {
  getProgressPercent,
  isListingFormat,
  isTrackActiveForListing,
  useAudio,
  useProgressStore,
} from "@sd/domain-audio";
import { useExploreRecentScreen } from "@sd/domain-content";
import { useTopicsList } from "@sd/domain-search";
import { useRouter } from "next/navigation";
import React, { useRef, useEffect, useMemo, type ReactNode } from "react";

import { useAuth } from "@/core/auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { useToast } from "@/core/toast";
import { audioService, usePlayListing } from "@/features/audio";
import { LectureCard } from "@/features/home/components/lecture-card/lecture-card";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { Button } from "@/shared/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { FeedSkeleton } from "../components/feed-skeleton/feed-skeleton";
import { FeedTopicRow } from "../components/feed-topic-row/feed-topic-row";
import { useExploreFilters } from "../hooks/use-explore-filters";
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

function getFeedProgress(
  progress: { positionSeconds: number; durationSeconds: number } | undefined,
) {
  return progress ? getProgressPercent(progress.positionSeconds, progress.durationSeconds) : 0;
}

function getFeedLessonCount(item: { publishedLectureCount?: number; lectureCount?: number }) {
  return item.publishedLectureCount ?? item.lectureCount ?? 1;
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
    isListingFormat(item.kind) &&
    isTrackActiveForListing({ id: item.id, slug: item.slug, format: item.kind }, currentTrack);

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

  const progress = useProgressStore((s) => s.progressMap[item.slug]);
  const progressPercent = getFeedProgress(progress);

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

  const totalLessons = getFeedLessonCount(item);

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

function buildFeedBlocks(
  items: FeedItemDto[],
  onNavigateToListing: (slug: string) => void,
  onNavigateToScholar: (slug: string) => void,
): ReactNode[] {
  const blocks: ReactNode[] = [];
  let cards: { key: string; node: ReactNode }[] = [];
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

  items.forEach((item) => {
    if (item.kind === "scholar_row") {
      flushGrid();
      const rowKey = item.scholars[0]?.slug ?? "scholars";
      blocks.push(
        <section className={styles.section} key={`scholar-row-${rowKey}`}>
          <FeedScholarRow scholars={item.scholars} onScholarPress={onNavigateToScholar} />
        </section>,
      );
    } else if (item.kind === "topic_row") {
      flushGrid();
      blocks.push(
        <section className={styles.section} key={`topic-row-${item.topicName}`}>
          <FeedTopicRow
            topicName={item.topicName}
            items={item.items}
            onItemPress={onNavigateToListing}
          />
        </section>,
      );
    } else {
      // SAFETY: the non-row branch excludes scholar_row and topic_row, leaving only listing content items.
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
            onNavigate={onNavigateToListing}
          />
        ),
      });
    }
  });

  flushGrid();
  return blocks;
}

function FeedBody({
  isHydrated,
  isRecentError,
  isRecentFetching,
  items,
  onRetry,
  onNavigateToListing,
  onNavigateToScholar,
  loadMoreRef,
  t,
}: {
  isHydrated: boolean;
  isRecentError: boolean;
  isRecentFetching: boolean;
  items: FeedItemDto[];
  onRetry: () => void;
  onNavigateToListing: (slug: string) => void;
  onNavigateToScholar: (slug: string) => void;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  if (!isHydrated) return <FeedSkeleton />;
  if (isRecentError && items.length === 0) {
    return (
      <div className={styles.state} role="alert">
        <span>{getErrorStateText("feed", t)}</span>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {t("feed.retry", "Try Again")}
        </Button>
      </div>
    );
  }
  if (isRecentFetching && items.length === 0) return <FeedSkeleton />;
  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("explore.noContentTitle", "No content yet")}</EmptyTitle>
          <EmptyDescription>
            {t("explore.noContent", "No content yet. Check back soon.")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      {buildFeedBlocks(items, onNavigateToListing, onNavigateToScholar)}
      <div ref={loadMoreRef} style={{ height: "20px" }} />
    </>
  );
}

// This screen predates the Explore redesign and already owns the feed, catalog,
// playback, and navigation composition. Keep the warning visible for a future
// screen decomposition, but do not block this vertical filter slice on that
// unrelated refactor.
// react-doctor-disable-next-line react-doctor/no-giant-component
export function FeedRecentScreen({
  onNavigateToListing,
  onNavigateToScholar,
}: FeedRecentScreenProps) {
  const { i18n, t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();
  const handleNavigateToListing = onNavigateToListing ?? navigateToListing;
  const handleNavigateToScholar =
    onNavigateToScholar ?? ((slug) => router.push(routes.scholars.detail(slug)));

  // Topic steering state. The API owns the mixed feed composition.
  const locale = i18n.language === "ar" ? "ar" : "en";
  const { filters, isHydrated, updateFilter } = useExploreFilters({ locale, userId: user?.id });

  const hasHydratedUrlTopic = useRef(false);
  useEffect(() => {
    const browserWindow = globalThis.window;
    if (!isHydrated || !browserWindow || hasHydratedUrlTopic.current) return;
    hasHydratedUrlTopic.current = true;
    const params = new URLSearchParams(browserWindow.location.search);
    const urlTopic = params.get("topic") ?? "";
    if (urlTopic && urlTopic !== filters.topic) updateFilter("topic", urlTopic);
  }, [filters.topic, isHydrated, updateFilter]);

  useEffect(() => {
    const browserWindow = globalThis.window;
    if (!isHydrated || !browserWindow) return;
    const url = new URL(browserWindow.location.href);
    if (filters.topic) url.searchParams.set("topic", filters.topic);
    else url.searchParams.delete("topic");
    browserWindow.history.replaceState(
      browserWindow.history.state,
      "",
      `${url.pathname}${url.search}`,
    );
  }, [filters.topic, isHydrated]);

  const { data: topics = [] } = useTopicsList();

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

  // Discovery feed data. Topic steering is part of the request identity.
  const {
    data: recentData,
    isFetching: isRecentFetching,
    isError: isRecentError,
    hasNextPage: hasRecentNextPage,
    fetchNextPage: fetchRecentNextPage,
    refetch: refetchRecent,
  } = useExploreRecentScreen({
    topicSlug: filters.topic || undefined,
  });

  const recentItems = recentData?.pages.flatMap((p) => p.items) ?? [];
  const visibleRecentItems = recentItems;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasRecentNextPage || isRecentFetching) return;

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
  }, [hasRecentNextPage, isRecentFetching, fetchRecentNextPage]);

  const feedTitle = t("explore.title", "Explore");
  const body = (
    <FeedBody
      isHydrated={isHydrated}
      isRecentError={isRecentError}
      isRecentFetching={isRecentFetching}
      items={visibleRecentItems}
      onRetry={() => void refetchRecent()}
      onNavigateToListing={handleNavigateToListing}
      onNavigateToScholar={handleNavigateToScholar}
      loadMoreRef={loadMoreRef}
      t={t}
    />
  );

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <PageHeader title={feedTitle} />
          <div
            className={styles.topicSteering}
            aria-label={t("explore.topicSteering", "Explore by topic")}
          >
            <span className={styles.topicLabel}>
              {t("explore.exploreByTopic", "Explore by topic")}
            </span>
            <ToggleGroup
              type="single"
              value={filters.topic}
              onValueChange={(value) => updateFilter("topic", value)}
              className={styles.topicGroup}
            >
              <ToggleGroupItem value="" aria-label={t("explore.allTopics", "All topics")}>
                {t("explore.allTopics", "All")}
              </ToggleGroupItem>
              {topicChips.map((topic) => (
                <ToggleGroupItem key={topic.id} value={topic.id}>
                  {topic.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
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
