"use client";

import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { FeedContentCardWeb } from "../components/feed-content-card/feed-content-card.web";
import { FeedScholarRowWeb } from "../components/feed-scholar-row/feed-scholar-row.web";
import { useFeed } from "../hooks/use-feed";

export type FeedFollowingDesktopWebScreenProps = {
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
        <FeedScholarRowWeb
          key="scholar-row"
          scholars={item.scholars}
          onScholarPress={onNavigateToScholar}
        />
      );
    case "topic_row":
      return null;
    default:
      return (
        <FeedContentCardWeb
          key={item.id}
          item={item as FeedContentItemDto}
          onPress={() => onNavigateToLecture?.(item.slug)}
        />
      );
  }
}

export function FeedFollowingDesktopWebScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedFollowingDesktopWebScreenProps) {
  const { data, isFetching, hasNextPage, fetchNextPage } = useFeed();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 32 }}>Loading followed scholars...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 32, color: "#666" }}>
        Follow scholars to see their latest lectures here.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, marginBottom: 16 }}>Following</h2>
      {items.map((item) => renderFeedItem(item, onNavigateToLecture, onNavigateToScholar))}
      {hasNextPage && (
        <div style={{ padding: 16, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => fetchNextPage()}
            style={{
              padding: "8px 24px",
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: "pointer",
              background: "#fff",
            }}
          >
            {isFetching ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
