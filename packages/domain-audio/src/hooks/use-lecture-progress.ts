import { useProgressStore } from "../progress/progress.store";

export function useLectureProgress(lectureId: string) {
  const progress = useProgressStore((state) => state.progressMap[lectureId]);

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
