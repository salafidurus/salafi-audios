"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import type { ScholarListItemDto } from "@sd/core-contracts";

const cardButtonStyle: CSSProperties = {
  border: "1px solid var(--border-default)",
  borderRadius: 12,
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  cursor: "pointer",
  background: "var(--surface-default)",
  transition: "transform 0.2s, box-shadow 0.2s",
};

export type ScholarCardProps = {
  scholar: ScholarListItemDto;
  onPress?: (slug: string) => void;
};

export function ScholarCard({ scholar, onPress }: ScholarCardProps) {
  return (
    <button type="button" onClick={() => onPress?.(scholar.slug)} style={cardButtonStyle}>
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
          <Image
            src={scholar.imageUrl}
            alt={scholar.name}
            width={80}
            height={80}
            unoptimized
            style={{ objectFit: "cover" }}
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
    </button>
  );
}
