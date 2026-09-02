import { getProgressPercent } from "../playback/playback.utils";
import { useProgressStore } from "../progress/progress.store";

/** Listing-progress hook module exposing personal Listening continuity. */
/** Returns completion, resume, and percentage projections for one Listing. */
export function useListingProgress(listingSlug: string) {
  const progress = useProgressStore((state) => state.progressMap[listingSlug]);

  const isCompleted = !!progress?.completedAt;
  const resumePositionSeconds = progress?.positionSeconds ?? 0;
  const progressPercent = progress
    ? getProgressPercent(progress.positionSeconds, progress.durationSeconds)
    : 0;

  return {
    isCompleted,
    resumePositionSeconds,
    progressPercent,
  };
}
