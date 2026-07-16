"use client";

import { useListingProgress } from "@sd/domain-audio";
import styles from "./resume-badge.module.css";

type ResumeBadgeProps = {
  listingId: string;
};

export function ResumeBadge({ listingId }: ResumeBadgeProps) {
  const { resumePositionSeconds, isCompleted, progressPercent } = useListingProgress(listingId);

  if (isCompleted) {
    return <span className={styles.completedBadge}>✓ Completed</span>;
  }

  if (resumePositionSeconds === 0 || progressPercent === 0) {
    return null;
  }
  return <span className={styles.resumeBadge}>Resume at {formatTime(resumePositionSeconds)}</span>;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
