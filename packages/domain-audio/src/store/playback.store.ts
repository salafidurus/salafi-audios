import { create } from "zustand";
import type { PlaybackState, PlaybackStatus } from "../types/state.types";
import type { Track } from "../types/track.types";

type PlaybackActions = {
  setCurrentTrack: (track: Track | null) => void;
  setStatus: (status: PlaybackStatus) => void;
  setPosition: (positionSeconds: number) => void;
  setDuration: (durationSeconds: number) => void;
  setSpeed: (speed: number) => void;
  setError: (error?: string) => void;
  stop: () => void;
};

export type PlaybackStore = PlaybackState & { actions: PlaybackActions };

export const usePlaybackStore = create<PlaybackStore>((set) => ({
  currentTrack: null,
  status: "idle",
  positionSeconds: 0,
  durationSeconds: 0,
  speed: 1.0,
  error: undefined,

  actions: {
    setCurrentTrack: (track) => set({ currentTrack: track, error: undefined }),
    setStatus: (status) => set({ status }),
    setPosition: (positionSeconds) => set({ positionSeconds }),
    setDuration: (durationSeconds) => set({ durationSeconds }),
    setSpeed: (speed) => set({ speed }),
    setError: (error) => set({ status: "error", error }),
    stop: () => set({ currentTrack: null, status: "idle", positionSeconds: 0, durationSeconds: 0 }),
  },
}));
