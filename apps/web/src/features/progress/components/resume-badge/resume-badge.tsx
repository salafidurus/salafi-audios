"use client";

import { useListingProgress } from "@sd/domain-audio";

type ResumeBadgeProps = {
  listingId: string;
};

export function ResumeBadge({ listingId }: ResumeBadgeProps) {
  const { resumePositionSeconds, isCompleted, progressPercent } = useListingProgress(listingId);

  if (isCompleted) {
    return (
      <span
        style={{
          fontSize: 12,
          color: "#16a34a",
          fontWeight: 600,
          padding: "2px 6px",
          backgroundColor: "#f0fdf4",
          borderRadius: 4,
        }}
      >
        ✓ Completed
      </span>
    );
  }

  if (resumePositionSeconds === 0 || progressPercent === 0) return null;

  return (
    <span
      style={{
        fontSize: 12,
        color: "#2563eb",
        fontWeight: 500,
        padding: "2px 6px",
        backgroundColor: "#eff6ff",
        borderRadius: 4,
      }}
    >
      Resume at {formatTime(resumePositionSeconds)}
    </span>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
