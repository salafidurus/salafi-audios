"use client";

import type { CSSProperties } from "react";
import type { ContentSuggestionDto } from "@sd/core-contracts";

const itemButtonStyle: CSSProperties = {
  minWidth: 200,
  padding: 12,
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  backgroundColor: "var(--surface-default)",
  cursor: "pointer",
  transition: "box-shadow 0.2s ease",
  textAlign: "left",
};

export type FeedTopicRowProps = {
  topicName: string;
  items: ContentSuggestionDto[];
  onItemPress?: (slug: string) => void;
};

export function FeedTopicRow({ topicName, items, onItemPress }: FeedTopicRowProps) {
  if (!items.length) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <h3
        style={{
          margin: 0,
          marginBottom: 12,
          fontSize: 16,
          fontWeight: 600,
          color: "var(--content-strong)",
        }}
      >
        New in {topicName}
      </h3>
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 8,
          scrollbarWidth: "thin",
        }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            style={itemButtonStyle}
            onClick={() => onItemPress?.(item.slug)}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 4,
                lineHeight: "1.4",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--content-muted)",
                marginBottom: 4,
              }}
            >
              {item.scholarName}
            </div>
            {item.durationSeconds && (
              <div style={{ fontSize: 12, color: "var(--content-subtle)" }}>
                {Math.floor(item.durationSeconds / 60)}m
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
