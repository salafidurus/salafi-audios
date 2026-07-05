import { useProgressStore } from "../progress/progress.store";

export function useListingProgress(listingId: string) {
  const progress = useProgressStore((state) => state.progressMap[listingId]);

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
