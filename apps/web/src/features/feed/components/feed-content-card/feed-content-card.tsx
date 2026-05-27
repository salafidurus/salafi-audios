"use client";

import type { FeedContentItemDto } from "@sd/core-contracts";

export type FeedContentCardProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

export function FeedContentCard({ item, onPress }: FeedContentCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onPress}
      onKeyDown={(e) => e.key === "Enter" && onPress?.()}
      style={{
        padding: 16,
        borderBottom: "1px solid var(--border-subtle)",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600 }}>{item.title}</div>
      <div style={{ fontSize: 13, color: "var(--content-muted)", marginTop: 4 }}>
        {item.scholarName}
        {item.kind !== "lecture" && ` · ${item.kind}`}
      </div>
      <div style={{ fontSize: 12, color: "var(--content-subtle)", marginTop: 4 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.publishedAt && ` · ${new Date(item.publishedAt).toLocaleDateString()}`}
      </div>
    </article>
  );
}
