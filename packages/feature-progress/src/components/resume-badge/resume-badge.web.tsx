"use client";

import { useLectureProgress } from "@sd/domain-progress";

type ResumeBadgeWebProps = {
  lectureId: string;
};

export function ResumeBadgeWeb({ lectureId }: ResumeBadgeWebProps) {
  const { resumePositionSeconds, isCompleted, progressPercent } = useLectureProgress(lectureId);

  if (isCompleted) {
    return (
      <span
        style={{
          fontSize: 11,
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
        fontSize: 11,
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
