"use client";

import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { FeedListRow } from "../components/feed-list-row/feed-list-row";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { useFeedFollowingScreen } from "@sd/domain-content";

export type FeedFollowingDesktopScreenProps = {
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
        <FeedListRow
          key={item.id}
          item={item as FeedContentItemDto}
          onPress={() => onNavigateToLecture?.(item.slug)}
        />
      );
  }
}

export function FeedFollowingDesktopScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedFollowingDesktopScreenProps) {
  const { data, isFetching, hasNextPage, fetchNextPage } = useFeedFollowingScreen();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 32 }}>Loading followed scholars…</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 32, color: "var(--content-muted)" }}>
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
              border: "1px solid var(--border-default)",
              borderRadius: 6,
              cursor: "pointer",
              background: "var(--surface-default)",
            }}
          >
            {isFetching ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
