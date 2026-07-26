"use client";

import type { CSSProperties } from "react";
import type { ContentSuggestionDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

const itemButtonStyle: CSSProperties = {
  minWidth: 200,
  padding: 12,
  border: "1px solid var(--border-default)",
  borderRadius: 8,
  backgroundColor: "var(--surface-default)",
  cursor: "pointer",
  transition: "box-shadow 0.2s ease",
  textAlign: "start",
};

function FeedTopicItem({
  item,
  showOriginal,
  onItemPress,
}: {
  item: ContentSuggestionDto;
  showOriginal: boolean;
  onItemPress?: (slug: string) => void;
}) {
  const title = pickContentField(item.title, item.original?.title, showOriginal);
  const scholarName = useFormattedScholarName(item.scholarName);

  return (
    <button
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
        {title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--content-muted)",
          marginBottom: 4,
        }}
      >
        {scholarName}
      </div>
      {item.durationSeconds && (
        <div style={{ fontSize: 12, color: "var(--content-subtle)" }}>
          {Math.floor(item.durationSeconds / 60)}m
        </div>
      )}
    </button>
  );
}

export type FeedTopicRowProps = {
  topicName: string;
  items: ContentSuggestionDto[];
  onItemPress?: (slug: string) => void;
};

export function FeedTopicRow({ topicName, items, onItemPress }: FeedTopicRowProps) {
  const { t } = useTranslation();
  const showOriginal = useShowOriginalContent();

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 12,
          color: "var(--content-default)",
        }}
      >
        {topicName}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        {items.map((item) => (
          <FeedTopicItem
            key={item.id}
            item={item}
            showOriginal={showOriginal}
            onItemPress={onItemPress}
          />
        ))}
      </div>
    </div>
  );
}
