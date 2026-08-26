"use client";

import { useListingProgress } from "@sd/domain-audio";

type ProgressIndicatorProps = {
  listingSlug: string;
  size?: number;
};

export function ProgressIndicator({ listingSlug, size = 32 }: ProgressIndicatorProps) {
  const { progressPercent, isCompleted } = useListingProgress(listingSlug);

  if (progressPercent === 0 && !isCompleted) {
    return null;
  }
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
        stroke="var(--border-default)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isCompleted ? "var(--state-success)" : "var(--accent-primary-bg)"}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}
