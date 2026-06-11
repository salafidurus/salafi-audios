import type { Track } from "./track.types";

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

export type QueueItem = {
  track: Track;
  addedAt: number;
};

export type PlaybackState = {
  currentTrack: Track | null;
  status: PlaybackStatus;
  positionSeconds: number;
  durationSeconds: number;
  speed: number;
  error?: string;
};
