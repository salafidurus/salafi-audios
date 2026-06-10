import type { Track } from "../types/track.types";
import type { PlaybackStatus } from "../types/state.types";

export type PlaybackEngineEvents = {
  onTrackEnd?: () => void;
  onStatusChange?: (status: PlaybackStatus) => void;
  onPositionChange?: (positionSeconds: number) => void;
  onDurationChange?: (durationSeconds: number) => void;
  onError?: (error: string) => void;
};

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
