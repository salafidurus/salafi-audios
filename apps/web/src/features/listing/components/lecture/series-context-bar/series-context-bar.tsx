"use client";

import type { SeriesContextDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";
import styles from "./series-context-bar.module.css";

export type SeriesContextBarProps = {
  seriesContext: SeriesContextDto;
  onNavigate?: (lectureId: string) => void;
};

export function SeriesContextBar({ seriesContext, onNavigate }: SeriesContextBarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.seriesLabel}>
        <AppText variant="caption">Part of series</AppText>
      </div>
      <div className={styles.seriesTitle}>
        <AppText variant="titleMd">{seriesContext.seriesTitle}</AppText>
      </div>

      <div className={styles.navButtonsRow}>
        {seriesContext.prevLecture ? (
          <button
            type="button"
            onClick={() => onNavigate?.(seriesContext.prevLecture!.id)}
            className={`${styles.navButton} ${styles.navButtonLeft}`}
          >
            <div className={styles.navLabel}>← Previous</div>
            <div className={styles.navTitle}>{seriesContext.prevLecture.title}</div>
          </button>
        ) : (
          <div className={styles.spacer} />
        )}

        {seriesContext.nextLecture ? (
          <button
            type="button"
            onClick={() => onNavigate?.(seriesContext.nextLecture!.id)}
            className={`${styles.navButton} ${styles.navButtonRight}`}
          >
            <div className={styles.navLabel}>Next →</div>
            <div className={styles.navTitle}>{seriesContext.nextLecture.title}</div>
          </button>
        ) : (
          <div className={styles.spacer} />
        )}
      </div>
    </div>
  );
}
