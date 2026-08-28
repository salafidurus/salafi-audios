import type { PlaybackStatus } from "../types/state.types";
import type { Track } from "../types/track.types";

/** Playback-adapter module defining platform event and control boundaries. */
/** Optional callbacks emitted by a platform playback adapter. */
export type PlaybackEngineEvents = {
  /** Signals natural end of the active track. */
  onTrackEnd?: () => void;
  /** Reports a status transition from the platform engine. */
  onStatusChange?: (status: PlaybackStatus) => void;
  /** Reports current playback position in seconds. */
  onPositionChange?: (positionSeconds: number) => void;
  /** Reports the active track duration in seconds. */
  onDurationChange?: (durationSeconds: number) => void;
  /** Reports a platform playback error. */
  onError?: (error: string) => void;
  /** OS/browser-level "previous track" command (lock screen, media keys, MediaSession). */
  onSkipPrevious?: () => void;
  /** OS/browser-level "next track" command (lock screen, media keys, MediaSession). */
  onSkipNext?: () => void;
};

/** Platform adapter consumed by the platform-neutral Listening session. */
export interface PlaybackEngine {
  setup(): Promise<void>;
  load(track: Track): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(positionSeconds: number): Promise<void>;
  setSpeed(speed: number): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  setEvents(events: PlaybackEngineEvents): void;
}
