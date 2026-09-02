import type { Track } from "./track.types";

/** Playback state vocabulary shared by engines, stores, and UI consumers. */
/** Status values reported by a playback engine during a track lifecycle. */
export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

/** Observable client playback state, separate from publication and authorization state. */
export type PlaybackState = {
  /** Track currently loaded for playback. */
  currentTrack: Track | null;
  /** Current engine status. */
  status: PlaybackStatus;
  /** Current position in the active track, in seconds. */
  positionSeconds: number;
  /** Active track duration, in seconds. */
  durationSeconds: number;
  /** Current playback speed multiplier. */
  speed: number;
  /** User-visible playback failure, when the engine reports one. */
  error?: string;
  /** Mirrors QueueManager's state so queue-dependent UI (Next/Prev, "Lesson X of Y") is reactive. */
  queue: Track[];
  /** Index of the active track, or `-1` when no queue is active. */
  currentIndex: number;
};
