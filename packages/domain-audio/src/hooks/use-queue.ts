import { usePlaybackStore } from "../store/playback.store";

/** Reactive view of the current playback queue, for Next/Prev controls and "Lesson X of Y" UI. */
export function useQueue() {
  const queue = usePlaybackStore((s) => s.queue);
  const currentIndex = usePlaybackStore((s) => s.currentIndex);

  const currentTrack =
    currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;
  const hasNext = currentIndex >= 0 && currentIndex + 1 < queue.length;
  const hasPrevious = currentIndex > 0;

  return {
    queue,
    currentIndex,
    currentTrack,
    queueLength: queue.length,
    hasNext,
    hasPrevious,
  };
}
