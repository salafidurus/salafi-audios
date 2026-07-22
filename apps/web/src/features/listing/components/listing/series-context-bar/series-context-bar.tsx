"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SeriesContextDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";
import styles from "./series-context-bar.module.css";

export type SeriesContextBarProps = {
  seriesContext: SeriesContextDto;
  onNavigate?: (lectureId: string) => void;
};

export function SeriesContextBar({ seriesContext, onNavigate }: SeriesContextBarProps) {
  const isRtl = useIsRtl();
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
            <div className={styles.navLabel}>
              {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />} Previous
            </div>
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
            <div className={styles.navLabel}>
              Next {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </div>
            <div className={styles.navTitle}>{seriesContext.nextLecture.title}</div>
          </button>
        ) : (
          <div className={styles.spacer} />
        )}
      </div>
    </div>
  );
}
