import { useCallback } from "react";
import { usePlaybackStore } from "../store/playback.store";
import type { Track } from "../types";

export function usePlayback() {
  const currentTrack = usePlaybackStore((s) => s.currentTrack);
  const status = usePlaybackStore((s) => s.status);
  const positionSeconds = usePlaybackStore((s) => s.positionSeconds);
  const durationSeconds = usePlaybackStore((s) => s.durationSeconds);
  const queue = usePlaybackStore((s) => s.queue);
  const error = usePlaybackStore((s) => s.error);
  const actions = usePlaybackStore((s) => s.actions);

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const hasTrack = currentTrack !== null;

  const progressPercent = durationSeconds > 0 ? (positionSeconds / durationSeconds) * 100 : 0;

  const play = useCallback((track: Track) => actions.play(track), [actions]);
  const pause = useCallback(() => actions.pause(), [actions]);
  const resume = useCallback(() => actions.resume(), [actions]);
  const seek = useCallback((seconds: number) => actions.seek(seconds), [actions]);
  const stop = useCallback(() => actions.stop(), [actions]);
  const skipToNext = useCallback(() => actions.skipToNext(), [actions]);

  return {
    currentTrack,
    status,
    positionSeconds,
    durationSeconds,
    queue,
    error,
    isPlaying,
    isLoading,
    hasTrack,
    progressPercent,
    play,
    pause,
    resume,
    seek,
    stop,
    skipToNext,
  };
}
