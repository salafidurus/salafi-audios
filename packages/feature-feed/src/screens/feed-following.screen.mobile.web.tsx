"use client";

import type { FeedItemDto } from "@sd/core-contracts";
import { useFeedFollowingScreen } from "../hooks/use-feed-following";

export type FeedFollowingMobileWebScreenProps = {
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

export function FeedFollowingMobileWebScreen({
  onNavigateToLecture,
}: FeedFollowingMobileWebScreenProps) {
  const { items, isFetching } = useFeedFollowingScreen();

  if (isFetching && items.length === 0) {
    return <div style={{ padding: 16 }}>Loading followed scholars...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: 16, color: "#666" }}>
        Follow scholars to see their latest lectures here.
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18, marginBottom: 12 }}>Following</h2>
      {items.map((item) => (
        <FeedItem key={item.id} item={item} onPress={() => onNavigateToLecture?.(item.lectureId)} />
      ))}
    </div>
  );
}
