import { usePlaybackStore } from "../store/playback.store";

/** Playback hook module exposing reactive state for Listening UI consumers. */
/** Returns reactive playback state and derived UI convenience flags. */
export function useAudio() {
  const currentTrack = usePlaybackStore((s) => s.currentTrack);
  const status = usePlaybackStore((s) => s.status);
  const positionSeconds = usePlaybackStore((s) => s.positionSeconds);
  const durationSeconds = usePlaybackStore((s) => s.durationSeconds);
  const speed = usePlaybackStore((s) => s.speed);
  const error = usePlaybackStore((s) => s.error);

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const isPaused = status === "paused";
  const hasTrack = currentTrack !== null;

  const progressPercent = durationSeconds > 0 ? (positionSeconds / durationSeconds) * 100 : 0;

  return {
    currentTrack,
    status,
    positionSeconds,
    durationSeconds,
    speed,
    error,
    isPlaying,
    isLoading,
    isPaused,
    hasTrack,
    progressPercent,
  };
}
