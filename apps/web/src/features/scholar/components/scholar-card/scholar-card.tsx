"use client";

import type { ScholarListItemDto } from "@sd/core-contracts";

export type ScholarCardProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
};

export function ScholarCard({ scholar, onPress }: ScholarCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPress?.(scholar.slug)}
      onKeyDown={(e) => e.key === "Enter" && onPress?.(scholar.slug)}
      style={{
        border: "1px solid var(--border-default)",
        borderRadius: 12,
        padding: 16,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        background: "var(--surface-default)",
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          overflow: "hidden",
          background: "var(--surface-hover)",
          flexShrink: 0,
        }}
      >
        {scholar.imageUrl && (
          <img
            src={scholar.imageUrl}
            alt={scholar.name}
            style={{ width: 80, height: 80, objectFit: "cover" }}
          />
        )}
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 15,
          textAlign: "center",
          color: "var(--content-strong)",
        }}
      >
        {scholar.name}
      </div>
      {scholar.mainLanguage && (
        <div style={{ fontSize: 12, color: "var(--content-muted)" }}>{scholar.mainLanguage}</div>
      )}
      <div style={{ fontSize: 12, color: "var(--content-muted)" }}>
        {scholar.lectureCount} lectures
      </div>
    </div>
  );
}
