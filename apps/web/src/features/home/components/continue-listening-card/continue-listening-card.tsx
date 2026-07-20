"use client";

import type { RecentProgressDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";
import styles from "./continue-listening-card.module.css";

export type ContinueListeningCardProps = {
  recentProgress: RecentProgressDto;
  onContinueListening?: (lectureId: string) => void;
};

export function ContinueListeningCard({
  recentProgress,
  onContinueListening,
}: ContinueListeningCardProps) {
  return (
    <section
      className={styles.continueSection}
      aria-label="Resume playback"
      data-testid="continue-listening-section"
    >
      <AppText variant="titleMd">
        <span data-testid="continue-listening-title">Continue Listening</span>
      </AppText>
      <button
        type="button"
        data-testid="continue-listening-card"
        onClick={() => onContinueListening?.(recentProgress.lectureId)}
        className={styles.continueCard}
      >
        <div className={styles.continueHeader}>
          <AppText
            variant="bodyLg"
            style={{ fontWeight: "var(--typo-body-lg-font-weight-bold)" }}
          >
            <span data-testid="continue-listening-lecture-title">
              {recentProgress.lectureTitle}
            </span>
          </AppText>
          <AppText variant="caption" style={{ color: "var(--content-secondary)" }}>
            <span data-testid="continue-listening-scholar-name">
              {recentProgress.scholarName}
            </span>
          </AppText>
        </div>
        <div className={styles.progressRow}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{
                width: `${recentProgress.durationSeconds > 0 ? (recentProgress.positionSeconds / recentProgress.durationSeconds) * 100 : 0}%`,
              }}
            />
          </div>
          <AppText
            variant="caption"
            style={{ color: "var(--content-muted)", whiteSpace: "nowrap" }}
          >
            <span data-testid="continue-listening-progress-text">
              {formatDuration(recentProgress.positionSeconds)} /{" "}
              {formatDuration(recentProgress.durationSeconds)}
            </span>
          </AppText>
        </div>
      </button>
    </section>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
