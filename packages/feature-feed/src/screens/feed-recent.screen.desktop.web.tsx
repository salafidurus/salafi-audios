"use client";

import type { FeedItemDto } from "@sd/core-contracts";
import { useFeedRecentScreen } from "../hooks/use-feed-recent";

export type FeedRecentDesktopWebScreenProps = {
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
        padding: 16,
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600 }}>{item.lectureTitle}</div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
        {item.scholarName}
        {item.seriesTitle && ` · ${item.seriesTitle}`}
      </div>
      <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.publishedAt && ` · ${new Date(item.publishedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
}

export function FeedRecentDesktopWebScreen({
  onNavigateToLecture,
}: FeedRecentDesktopWebScreenProps) {
  const { items, isFetching } = useFeedRecentScreen();

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 32 }}>Loading recent lectures...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 32, color: "#666" }}>No recent lectures yet. Check back soon.</div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 22, marginBottom: 16 }}>Recent</h2>
      {items.map((item) => (
        <FeedItem key={item.id} item={item} onPress={() => onNavigateToLecture?.(item.lectureId)} />
      ))}
    </div>
  );
}
