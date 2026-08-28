"use client";

import type { SeriesContextDto } from "@sd/core-contracts";

import { useQueue } from "@sd/domain-audio";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { audioService } from "@/features/audio";
import { AppText } from "@/shared/components/AppText/AppText";
import { Button } from "@/shared/components/ui/button";
import { useIsRtl } from "@/shared/hooks/use-is-rtl";

import styles from "./series-context-bar.module.css";

export type SeriesContextBarProps = {
  seriesContext: SeriesContextDto;
  /** The lesson this bar is shown for — Previous/Next only act when it's the one currently playing. */
  listingSlug: string;
};

function getPreviousTrack(
  queue: { slug: string }[],
  currentIndex: number,
  isActiveQueue: boolean,
  hasPrevious: boolean,
) {
  return isActiveQueue && hasPrevious ? (queue[currentIndex - 1] ?? null) : null;
}

function getNextTrack(
  queue: { slug: string }[],
  currentIndex: number,
  isActiveQueue: boolean,
  hasNext: boolean,
) {
  return isActiveQueue && hasNext ? (queue[currentIndex + 1] ?? null) : null;
}

function renderNavigationButton(
  track: { title: string } | null,
  direction: "previous" | "next",
  isRtl: boolean,
) {
  if (!track) return <div className={styles.spacer} />;

  const isPrevious = direction === "previous";
  const className = isPrevious ? styles.navButtonLeft : styles.navButtonRight;
  const skip = isPrevious ? () => audioService.skipToPrevious() : () => audioService.skipToNext();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={skip}
      className={`${styles.navButton} ${className}`}
    >
      <div className={styles.navLabel}>
        {isPrevious ? (
          <>{isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />} Previous</>
        ) : (
          <>Next {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}</>
        )}
      </div>
      <div className={styles.navTitle}>{track.title}</div>
    </Button>
  );
}

export function SeriesContextBar({ seriesContext, listingSlug }: SeriesContextBarProps) {
  const isRtl = useIsRtl();
  const { queue, currentIndex, currentTrack, hasNext, hasPrevious } = useQueue();

  // Prev/Next only make sense relative to the queue that's actually playing this lesson —
  // otherwise they'd show sibling info from an unrelated queue.
  const isActiveQueue = currentTrack?.slug === listingSlug;
  const prevTrack = getPreviousTrack(queue, currentIndex, isActiveQueue, hasPrevious);
  const nextTrack = getNextTrack(queue, currentIndex, isActiveQueue, hasNext);

  return (
    <div className={styles.container}>
      <div className={styles.seriesLabel}>
        <AppText variant="caption">Part of series</AppText>
      </div>
      <div className={styles.seriesTitle}>
        <AppText variant="titleMd">{seriesContext.seriesTitle}</AppText>
      </div>

      <div className={styles.navButtonsRow}>
        {renderNavigationButton(prevTrack, "previous", isRtl)}
        {renderNavigationButton(nextTrack, "next", isRtl)}
      </div>
    </div>
  );
}
