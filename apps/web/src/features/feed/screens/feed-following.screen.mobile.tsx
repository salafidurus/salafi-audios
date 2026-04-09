"use client";

import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { FeedContentCard } from "../components/feed-content-card/feed-content-card";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { useFeed } from "@sd/domain-content";

export type FeedFollowingMobileScreenProps = {
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

export function FeedFollowingMobileScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedFollowingMobileScreenProps) {
  const { data, isFetching, hasNextPage, fetchNextPage } = useFeed();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 16 }}>Loading followed scholars...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 16, color: "var(--content-muted)" }}>
        Follow scholars to see their latest lectures here.
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>Following</h2>
      {items.map((item) => renderFeedItem(item, onNavigateToLecture, onNavigateToScholar))}
      {hasNextPage && (
        <div style={{ padding: 12, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => fetchNextPage()}
            style={{
              padding: "8px 20px",
              border: "1px solid var(--border-default)",
              borderRadius: 6,
              cursor: "pointer",
              background: "var(--surface-default)",
            }}
          >
            {isFetching ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
