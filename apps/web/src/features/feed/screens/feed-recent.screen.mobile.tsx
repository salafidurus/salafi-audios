"use client";

import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { useFeedRecentScreen } from "@sd/domain-content";
import { FeedContentCard } from "../components/feed-content-card/feed-content-card";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import styles from "./feed-recent.screen.mobile.module.css";

export type FeedMobileScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function renderFeedItem(
  item: FeedItemDto,
  onNavigateToLecture?: (slug: string) => void,
  onNavigateToScholar?: (slug: string) => void,
) {
  switch (item.kind) {
    case "scholar_row":
      return (
        <FeedScholarRow
          key="scholar-row"
          scholars={item.scholars}
          onScholarPress={onNavigateToScholar}
        />
      );
    case "topic_row":
      return null;
    default:
      return (
        <FeedContentCard
          key={item.id}
          item={item as FeedContentItemDto}
          onPress={() => onNavigateToLecture?.(item.slug)}
        />
      );
  }
}

export function FeedMobileScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedMobileScreenProps) {
  const { data, isFetching, hasNextPage, fetchNextPage } = useFeedRecentScreen();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <ScreenView>
      {isFetching && items.length === 0 ? (
        <p>Loading feed…</p>
      ) : items.length === 0 ? (
        <p>No content yet. Check back soon.</p>
      ) : (
        <>
          <h2 className={styles.title}>Feed</h2>
          {items.map((item) => renderFeedItem(item, onNavigateToLecture, onNavigateToScholar))}
          {hasNextPage && (
            <div className={styles.loadMoreRow}>
              <button type="button" onClick={() => fetchNextPage()} className={styles.button}>
                {isFetching ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </ScreenView>
  );
}
