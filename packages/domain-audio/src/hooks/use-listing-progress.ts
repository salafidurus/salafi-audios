import { useProgressStore } from "../progress/progress.store";

export function useListingProgress(listingSlug: string) {
  const progress = useProgressStore((state) => state.progressMap[listingSlug]);

  const isCompleted = !!progress?.completedAt;
  const resumePositionSeconds = progress?.positionSeconds ?? 0;
  const progressPercent =
    progress && progress.durationSeconds > 0
      ? (progress.positionSeconds / progress.durationSeconds) * 100
      : 0;

  return {
    isCompleted,
    resumePositionSeconds,
    progressPercent,
  };
}
