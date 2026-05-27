"use client";

import type { FeedItemDto, FeedContentItemDto } from "@sd/core-contracts";
import { FeedContentCard } from "../components/feed-content-card/feed-content-card";
import { FeedScholarRow } from "../components/feed-scholar-row/feed-scholar-row";
import { FeedTopicRow } from "../components/feed-topic-row/feed-topic-row";
import { useFeed } from "@sd/domain-content";

export type FeedDesktopScreenProps = {
  onNavigateToLecture?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

function getFeedItemKey(item: FeedItemDto): string {
  if (item.kind === "scholar_row") return "scholar-row";
  if (item.kind === "topic_row") return `topic-row-${item.topicName}`;
  return item.id;
}

function renderFeedItem(
  item: FeedItemDto,
  onNavigateToLecture?: (slug: string) => void,
  onNavigateToScholar?: (slug: string) => void,
) {
  switch (item.kind) {
    case "scholar_row":
      return (
        <FeedScholarRow
          key={getFeedItemKey(item)}
          scholars={item.scholars}
          onScholarPress={onNavigateToScholar}
        />
      );
    case "topic_row":
      return (
        <FeedTopicRow
          key={getFeedItemKey(item)}
          topicName={item.topicName}
          items={item.items}
          onItemPress={onNavigateToLecture}
        />
      );
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

export function FeedDesktopScreen({
  onNavigateToLecture,
  onNavigateToScholar,
}: FeedDesktopScreenProps) {
  const { data, isFetching, hasNextPage, fetchNextPage } = useFeed();
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 32 }}>Loading feed\u2026</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 32, color: "var(--content-muted)" }}>
        No content yet. Check back soon.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, marginBottom: 16 }}>Feed</h2>
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
            {isFetching ? "Loading\u2026" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
