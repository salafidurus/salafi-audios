/** Loads the recent explore feed and assembles its discovery modules. */
"use client";

import {
  routes,
  type FeedContentItemDto,
  type ExploreListingsBatchDto,
  type ExploreScholarsBatchDto,
  type ExploreTopicItemDto,
  type ExploreTopicsBatchDto,
} from "@sd/core-contracts";
import { getErrorStateText } from "@sd/core-i18n";
import {
  getProgressPercent,
  isListingFormat,
  isTrackActiveForListing,
  useAudio,
  useProgressStore,
} from "@sd/domain-audio";
import { mergeExplorePages, useExploreRecentScreen } from "@sd/domain-content";
import { useRouter } from "next/navigation";
import React, { useRef, useEffect, type ReactNode } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { useToast } from "@/core/toast";
import { audioService, usePlayListing } from "@/features/audio";
import { ScholarGridCard } from "@/features/explore/components/scholar-grid-card/scholar-grid-card";
import { LectureCard } from "@/features/home/components/lecture-card/lecture-card";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { Button } from "@/shared/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

import { FeedSkeleton } from "../components/feed-skeleton/feed-skeleton";
import styles from "./explore-recent.screen.module.css";

/** Optional route callbacks that let parent layouts retain navigation ownership. */
export type FeedRecentScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function getExploreLocale(language: string) {
  return language === "ar" ? "ar" : "en";
}

function useScholarNavigation(onNavigateToScholar?: (slug: string) => void) {
  const router = useRouter();
  return onNavigateToScholar ?? ((slug: string) => router.push(routes.scholars.detail(slug)));
}

function formatDuration(durationSeconds?: number | null): string {
  if (!durationSeconds || durationSeconds <= 0) return "";
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.round((durationSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getFeedProgress(
  progress:
    | {
        positionSeconds: number;
        /** Duration used to calculate the feed card's completion percentage. */
        durationSeconds: number;
      }
    | undefined,
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
    /** Stable route identity used to open and play the listing. */
    slug: string;
    title: string;
    /** Listing format used to build the playback queue. */
    kind: string;
    scholarName: string;
    /** Scholar route identity retained for playback metadata. */
    scholarSlug?: string;
    scholarImageUrl?: string | null;
    thumbnailUrl?: string | null;
    /** Duration used by the feed card metadata and progress presentation. */
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
      scholarImageUrl: item.scholarImageUrl,
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

/** Renders a display-ready topic identity without deriving recommendation meaning client-side. */
function TopicGridItem({ item }: { item: ExploreTopicItemDto }) {
  return (
    <article data-testid={`topic-card-${item.slug}`}>
      <span>{item.name}</span>
    </article>
  );
}

function buildFeedBlocks(
  batches: Array<ExploreListingsBatchDto | ExploreScholarsBatchDto | ExploreTopicsBatchDto>,
  onNavigateToListing: (slug: string) => void,
  onNavigateToScholar: (slug: string) => void,
  t: ReturnType<typeof useTranslation>["t"],
): ReactNode[] {
  const blocks: ReactNode[] = [];
  batches.forEach((batch) => {
    blocks.push(
      <section
        className={`${styles.module} ${
          batch.kind === "listings"
            ? styles.listingModule
            : batch.kind === "topics"
              ? styles.topicModule
              : styles.scholarModule
        }`}
        aria-label={batch.title.label}
        key={batch.id}
      >
        <h2>{batch.title.label || t("explore.listings", "Listings")}</h2>
        <div className={styles.grid}>
          {batch.kind === "listings"
            ? batch.items.map((feedContentItem: FeedContentItemDto) => (
                <FeedGridItemCard
                  key={feedContentItem.id}
                  item={feedContentItem}
                  onNavigate={onNavigateToListing}
                />
              ))
            : batch.kind === "scholars"
              ? batch.items.map((scholar) => (
                  <ScholarGridCard
                    key={scholar.id}
                    scholar={scholar}
                    onPress={onNavigateToScholar}
                  />
                ))
              : batch.items.map((item) => <TopicGridItem key={item.id} item={item} />)}
        </div>
      </section>,
    );
  });
  return blocks;
}

function FeedBody({
  isRecentError,
  isRecentFetching,
  items,
  onRetry,
  onNavigateToListing,
  onNavigateToScholar,
  loadMoreRef,
  t,
}: {
  /** Whether the recent-feed request failed and should show recovery UI. */
  isRecentError: boolean;
  isRecentFetching: boolean;
  items: Array<ExploreListingsBatchDto | ExploreScholarsBatchDto | ExploreTopicsBatchDto>;
  onRetry: () => void;
  onNavigateToListing: (slug: string) => void;
  onNavigateToScholar: (slug: string) => void;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  t: ReturnType<typeof useTranslation>["t"];
}) {
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
      {buildFeedBlocks(items, onNavigateToListing, onNavigateToScholar, t)}
      <div ref={loadMoreRef} style={{ height: "20px" }} />
    </>
  );
}

/**
 * Renders the API-composed Explore feed with presentation-only module grouping.
 * Feed ordering, pagination, navigation, and playback remain
 * owned by their existing API and domain seams.
 */
// react-doctor-disable-next-line react-doctor/no-giant-component
export function FeedRecentScreen({
  onNavigateToListing,
  onNavigateToScholar,
}: FeedRecentScreenProps) {
  const { i18n, t } = useTranslation();
  const handleNavigateToScholar = useScholarNavigation(onNavigateToScholar);
  const { navigateToListing } = useListingNavigation();
  const handleNavigateToListing = onNavigateToListing ?? navigateToListing;

  // Discovery feed composition and recommendation context are backend-owned.
  const {
    data: recentData,
    isFetching: isRecentFetching,
    isError: isRecentError,
    hasNextPage: hasRecentNextPage,
    fetchNextPage: fetchRecentNextPage,
    refetch: refetchRecent,
  } = useExploreRecentScreen({
    locale: getExploreLocale(i18n.language),
  });

  const recentItems = mergeExplorePages(recentData?.pages ?? []);
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
        </StickyHeaderLayout.Header>
        <StickyHeaderLayout.Content>
          <div className={styles.page}>{body}</div>
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
      <ScrollToTopButton />
    </ScreenView>
  );
}
