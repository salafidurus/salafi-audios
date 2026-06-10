"use client";

import type { CSSProperties } from "react";
import type { SeriesContextDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";

const containerStyle: CSSProperties = {
  marginTop: 24,
  padding: 16,
  borderRadius: 12,
  background: "var(--surface-subtle, #f8f8f8)",
  border: "1px solid var(--border-subtle, #e4e4e4)",
};

const navButtonStyle: CSSProperties = {
  background: "none",
  border: "1px solid var(--border-default, #ddd)",
  borderRadius: 8,
  padding: "8px 16px",
  cursor: "pointer",
  flex: 1,
  minWidth: 0,
};

export type SeriesContextBarProps = {
  seriesContext: SeriesContextDto;
  onNavigate?: (lectureId: string) => void;
};

export function SeriesContextBar({ seriesContext, onNavigate }: SeriesContextBarProps) {
  return (
    <div style={containerStyle}>
      <AppText variant="caption" style={{ color: "var(--content-muted, #888)" }}>
        Part of series
      </AppText>
      <AppText variant="titleMd" style={{ marginTop: 4 }}>
        {seriesContext.seriesTitle}
      </AppText>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, gap: 12 }}>
        {seriesContext.prevLecture ? (
          <button
            type="button"
            onClick={() => onNavigate?.(seriesContext.prevLecture!.id)}
            style={{ ...navButtonStyle, textAlign: "left" }}
          >
            <div style={{ fontSize: 12, color: "var(--content-muted, #888)" }}>← Previous</div>
            <div
              style={{
                fontSize: 13,
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {seriesContext.prevLecture.title}
            </div>
          </button>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {seriesContext.nextLecture ? (
          <button
            type="button"
            onClick={() => onNavigate?.(seriesContext.nextLecture!.id)}
            style={{ ...navButtonStyle, textAlign: "right" }}
          >
            <div style={{ fontSize: 12, color: "var(--content-muted, #888)" }}>Next →</div>
            <div
              style={{
                fontSize: 13,
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {seriesContext.nextLecture.title}
            </div>
          </button>
        ) : (
          <div style={{ flex: 1 }} />
        )}
      </div>
    </div>
  );
}
