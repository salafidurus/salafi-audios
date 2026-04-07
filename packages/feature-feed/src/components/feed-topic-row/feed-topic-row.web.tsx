"use client";

import type { ContentSuggestionDto } from "@sd/core-contracts";

export type FeedTopicRowWebProps = {
  topicName: string;
  items: ContentSuggestionDto[];
  onItemPress?: (slug: string) => void;
};

export function FeedTopicRowWeb({
  topicName,
  items,
  onItemPress,
}: FeedTopicRowWebProps) {
  if (!items.length) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ 
        margin: 0, 
        marginBottom: 12, 
        fontSize: 16, 
        fontWeight: 600,
        color: "#333" 
      }}>
        New in {topicName}
      </h3>
      <div style={{ 
        display: "flex", 
        gap: 12, 
        overflowX: "auto", 
        paddingBottom: 8,
        scrollbarWidth: "thin"
      }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              minWidth: 200,
              padding: 12,
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              backgroundColor: "#fff",
              cursor: "pointer",
              transition: "box-shadow 0.2s ease",
            }}
            onClick={() => onItemPress?.(item.slug)}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ 
              fontSize: 14, 
              fontWeight: 500, 
              marginBottom: 4,
              lineHeight: "1.4",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {item.title}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: "#666",
              marginBottom: 4
            }}>
              {item.scholarName}
            </div>
            {item.durationSeconds && (
              <div style={{ fontSize: 11, color: "#999" }}>
                {Math.floor(item.durationSeconds / 60)}m
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}