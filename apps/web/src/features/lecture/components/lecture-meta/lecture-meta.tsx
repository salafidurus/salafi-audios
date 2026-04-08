"use client";

import type { LectureDetailDto } from "@sd/core-contracts";
import { AppText } from "@sd/shared";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export type LectureMetaWebProps = {
  lecture: LectureDetailDto;
};

export function LectureMetaWeb({ lecture }: LectureMetaWebProps) {
  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 12 }}
    >
      {/* Scholar chip */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 12px 4px 4px",
          borderRadius: 999,
          background: "var(--surface-subtle, #f5f5f5)",
        }}
      >
        {lecture.scholar.imageUrl && (
          <img
            src={lecture.scholar.imageUrl}
            alt={lecture.scholar.name}
            style={{ width: 28, height: 28, borderRadius: 14, objectFit: "cover" }}
          />
        )}
        <AppText variant="labelMd">{lecture.scholar.name}</AppText>
      </div>

      {/* Published date */}
      {lecture.publishedAt && (
        <AppText variant="bodySm" style={{ color: "var(--content-muted, #888)" }}>
          {formatDate(lecture.publishedAt)}
        </AppText>
      )}

      {/* Duration */}
      {lecture.durationSeconds != null && (
        <AppText variant="bodySm" style={{ color: "var(--content-muted, #888)" }}>
          {formatDuration(lecture.durationSeconds)}
        </AppText>
      )}

      {/* Language */}
      {lecture.language && (
        <AppText variant="bodySm" style={{ color: "var(--content-muted, #888)" }}>
          {lecture.language}
        </AppText>
      )}
    </div>
  );
}
