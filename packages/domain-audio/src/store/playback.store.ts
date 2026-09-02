import { create } from "zustand";

import type { PlaybackState, PlaybackStatus } from "../types/state.types";
import type { Track } from "../types/track.types";

/** Reactive playback store module shared by engines and Listening UI hooks. */
type PlaybackActions = {
  setCurrentTrack: (track: Track | null) => void;
  /** Records the platform engine status. */
  setStatus: (status: PlaybackStatus) => void;
  setPosition: (positionSeconds: number) => void;
  /** Records the active track duration in seconds. */
  setDuration: (durationSeconds: number) => void;
  setSpeed: (speed: number) => void;
  /** Moves the store into an error state with an optional message. */
  setError: (error?: string) => void;
  /** Mirrors queue navigation state for reactive consumers. */
  setQueueState: (queue: Track[], currentIndex: number) => void;
  stop: () => void;
};

/** Playback state plus the mutations used by the Listening session. */
export type PlaybackStore = PlaybackState & { actions: PlaybackActions };

/** Global reactive playback state for the current client session. */
export const usePlaybackStore = create<PlaybackStore>((set) => ({
  currentTrack: null,
  status: "idle",
  positionSeconds: 0,
  durationSeconds: 0,
  speed: 1.0,
  error: undefined,
  queue: [],
  currentIndex: -1,

  actions: {
    setCurrentTrack: (track) => set({ currentTrack: track, error: undefined }),
    setStatus: (status) => set({ status }),
    setPosition: (positionSeconds) => set({ positionSeconds }),
    setDuration: (durationSeconds) => set({ durationSeconds }),
    setSpeed: (speed) => set({ speed }),
    setError: (error) => set({ status: "error", error }),
    setQueueState: (queue, currentIndex) => set({ queue, currentIndex }),
    stop: () =>
      set({
        currentTrack: null,
        status: "idle",
        positionSeconds: 0,
        durationSeconds: 0,
        queue: [],
        currentIndex: -1,
      }),
  },
}));
