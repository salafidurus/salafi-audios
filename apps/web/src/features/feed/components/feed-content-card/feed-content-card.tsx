"use client";

import type React from "react";
import type { FeedContentItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";

export type FeedContentCardProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

const feedContentCardButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: 16,
  cursor: "pointer",
  background: "none",
  border: "none",
  borderBottom: "1px solid var(--border-subtle)",
};

export function FeedContentCard({ item, onPress }: FeedContentCardProps) {
  const showOriginal = useShowOriginalContent();
  const title = pickContentField(item.title, item.original?.title, showOriginal);

  return (
    <button type="button" onClick={onPress} style={feedContentCardButtonStyle}>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--content-muted)", marginTop: 4 }}>
        {item.scholarName}
        {item.kind !== "single" && ` · ${item.kind}`}
      </div>
      <div style={{ fontSize: 12, color: "var(--content-subtle)", marginTop: 4 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.publishedAt && ` · ${new Date(item.publishedAt).toLocaleDateString()}`}
      </div>
    </button>
  );
}
