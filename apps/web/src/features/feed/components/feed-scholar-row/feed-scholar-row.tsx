"use client";

import type React from "react";
import Image from "next/image";
import type { ScholarChipDto } from "@sd/core-contracts";

export type FeedScholarRowProps = {
  scholars: ScholarChipDto[];
  onScholarPress?: (slug: string) => void;
};

const scholarButtonStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minWidth: 72,
  cursor: "pointer",
  background: "none",
  border: "none",
  padding: 0,
};

export function FeedScholarRow({ scholars, onScholarPress }: FeedScholarRowProps) {
  return (
    <div style={{ padding: "12px 0" }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--content-strong)",
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
          <button
            key={scholar.id}
            type="button"
            onClick={() => onScholarPress?.(scholar.slug)}
            style={scholarButtonStyle}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "var(--surface-hover)",
                marginBottom: 4,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {scholar.imageUrl && (
                <Image
                  src={scholar.imageUrl}
                  alt={scholar.name}
                  width={48}
                  height={48}
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--content-default)",
                textAlign: "center",
                maxWidth: 72,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {scholar.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
