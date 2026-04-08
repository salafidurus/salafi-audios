"use client";

import type { FeedContentItemDto } from "@sd/core-contracts";

export type FeedContentCardWebProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

export function FeedContentCardWeb({ item, onPress }: FeedContentCardWebProps) {
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
      <div style={{ fontSize: 16, fontWeight: 600 }}>{item.title}</div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
        {item.scholarName}
        {item.kind !== "lecture" && ` · ${item.kind}`}
      </div>
      <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.publishedAt && ` · ${new Date(item.publishedAt).toLocaleDateString()}`}
      </div>
    </div>
  );
}
