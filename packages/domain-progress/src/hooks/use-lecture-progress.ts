import { useCallback, useMemo } from "react";
import { useProgressStore } from "../store/progress.store";

export function useLectureProgress(lectureId: string) {
  const progress = useProgressStore((s) => s.progressMap[lectureId]);
  const { setProgress, markCompleted } = useProgressStore((s) => s.actions);

  const progressPercent = useMemo(() => {
    if (!progress || progress.durationSeconds === 0) return 0;
    return (progress.positionSeconds / progress.durationSeconds) * 100;
  }, [progress]);

  const isCompleted = !!progress?.completedAt;

  const updatePosition = useCallback(
    (positionSeconds: number, durationSeconds: number) => {
      setProgress(lectureId, positionSeconds, durationSeconds);
    },
    [lectureId, setProgress],
  );

  const markAsCompleted = useCallback(() => {
    markCompleted(lectureId);
  }, [lectureId, markCompleted]);

  return {
    progress,
    progressPercent,
    isCompleted,
    resumePositionSeconds: progress?.positionSeconds ?? 0,
    updatePosition,
    markAsCompleted,
  };
}
