"use client";

import type { SeriesContextDto } from "@sd/core-contracts";

import { useQueue } from "@sd/domain-audio";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { audioService } from "@/features/audio";
import { AppText } from "@/shared/components/AppText/AppText";
import { Button } from "@/shared/components/Button/Button";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";

import styles from "./series-context-bar.module.css";

export type SeriesContextBarProps = {
  seriesContext: SeriesContextDto;
  /** The lesson this bar is shown for — Previous/Next only act when it's the one currently playing. */
  lectureId: string;
};

export function SeriesContextBar({ seriesContext, lectureId }: SeriesContextBarProps) {
  const isRtl = useIsRtl();
  const { queue, currentIndex, currentTrack, hasNext, hasPrevious } = useQueue();

  // Prev/Next only make sense relative to the queue that's actually playing this lesson —
  // otherwise they'd show sibling info from an unrelated queue.
  const isActiveQueue = currentTrack?.id === lectureId;
  const prevTrack = isActiveQueue && hasPrevious ? (queue[currentIndex - 1] ?? null) : null;
  const nextTrack = isActiveQueue && hasNext ? (queue[currentIndex + 1] ?? null) : null;

  return (
    <div className={styles.container}>
      <div className={styles.seriesLabel}>
        <AppText variant="caption">Part of series</AppText>
      </div>
      <div className={styles.seriesTitle}>
        <AppText variant="titleMd">{seriesContext.seriesTitle}</AppText>
      </div>

      <div className={styles.navButtonsRow}>
        {prevTrack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => audioService.skipToPrevious()}
            className={`${styles.navButton} ${styles.navButtonLeft}`}
          >
            <div className={styles.navLabel}>
              {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />} Previous
            </div>
            <div className={styles.navTitle}>{prevTrack.title}</div>
          </Button>
        ) : (
          <div className={styles.spacer} />
        )}

        {nextTrack ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => audioService.skipToNext()}
            className={`${styles.navButton} ${styles.navButtonRight}`}
          >
            <div className={styles.navLabel}>
              Next {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </div>
            <div className={styles.navTitle}>{nextTrack.title}</div>
          </Button>
        ) : (
          <div className={styles.spacer} />
        )}
      </div>
    </div>
  );
}
