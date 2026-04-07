"use client";

import type { ScholarChipDto } from "@sd/core-contracts";

export type FeedScholarRowWebProps = {
  scholars: ScholarChipDto[];
  onScholarPress?: (slug: string) => void;
};

export function FeedScholarRowWeb({ scholars, onScholarPress }: FeedScholarRowWebProps) {
  return (
    <div style={{ padding: "12px 0" }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#333",
          marginBottom: 8,
          paddingLeft: 4,
        }}
      >
        Popular Scholars
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        {scholars.map((scholar) => (
          <div
            key={scholar.id}
            role="button"
            tabIndex={0}
            onClick={() => onScholarPress?.(scholar.slug)}
            onKeyDown={(e) => e.key === "Enter" && onScholarPress?.(scholar.slug)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 72,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#e0e0e0",
                marginBottom: 4,
                overflow: "hidden",
              }}
            >
              {scholar.imageUrl && (
                <img
                  src={scholar.imageUrl}
                  alt={scholar.name}
                  style={{ width: 48, height: 48, objectFit: "cover" }}
                />
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#555",
                textAlign: "center",
                maxWidth: 72,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {scholar.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
