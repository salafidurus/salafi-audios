"use client";

import type { FeedItemDto } from "@sd/core-contracts";
import { useFeedRecentScreen } from "../hooks/use-feed-recent";

export type FeedRecentMobileWebScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function FeedItem({ item, onPress }: { item: FeedItemDto; onPress?: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={(e) => e.key === "Enter" && onPress?.()}
      style={{
        padding: 12,
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600 }}>{item.lectureTitle}</div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.publishedAt && ` · ${new Date(item.publishedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
}

export function FeedRecentMobileWebScreen({ onNavigateToLecture }: FeedRecentMobileWebScreenProps) {
  const { items, isFetching } = useFeedRecentScreen();

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 16 }}>Loading recent lectures...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 16, color: "#666" }}>No recent lectures yet. Check back soon.</div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>Recent</h2>
      {items.map((item) => (
        <FeedItem key={item.id} item={item} onPress={() => onNavigateToLecture?.(item.lectureId)} />
      ))}
    </div>
  );
}
