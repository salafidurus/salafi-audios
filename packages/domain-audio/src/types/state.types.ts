import type { Track } from "./track.types";

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

export type PlaybackState = {
  currentTrack: Track | null;
  status: PlaybackStatus;
  positionSeconds: number;
  durationSeconds: number;
  speed: number;
  error?: string;
  /** Mirrors QueueManager's state so queue-dependent UI (Next/Prev, "Lesson X of Y") is reactive. */
  queue: Track[];
  currentIndex: number;
};
