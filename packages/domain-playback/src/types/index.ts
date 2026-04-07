export type Track = {
  id: string;
  lectureId: string;
  title: string;
  scholarName?: string;
  audioUrl: string;
  durationSeconds?: number;
  artworkUrl?: string;
};

export type QueueItem = {
  track: Track;
  addedAt: number;
};

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

export type PlaybackState = {
  currentTrack: Track | null;
  queue: QueueItem[];
  status: PlaybackStatus;
  positionSeconds: number;
  durationSeconds: number;
  error?: string;
};

export type PlaybackEngine = {
  setup(): Promise<void>;
  play(track: Track): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(positionSeconds: number): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
};
