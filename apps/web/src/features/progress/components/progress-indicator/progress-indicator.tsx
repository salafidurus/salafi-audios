"use client";

import { useLectureProgress } from "@sd/domain-progress";

type ProgressIndicatorWebProps = {
  lectureId: string;
  size?: number;
};

export function ProgressIndicatorWeb({ lectureId, size = 32 }: ProgressIndicatorWebProps) {
  const { progressPercent, isCompleted } = useLectureProgress(lectureId);

  if (progressPercent === 0 && !isCompleted) return null;

  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isCompleted ? "#16a34a" : "#2563eb"}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}
