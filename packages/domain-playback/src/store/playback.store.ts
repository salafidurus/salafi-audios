import { create } from "zustand";
import type { Track, QueueItem, PlaybackStatus, PlaybackState } from "../types";

type PlaybackActions = {
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seek: (positionSeconds: number) => void;
  stop: () => void;
  setStatus: (status: PlaybackStatus) => void;
  setPosition: (positionSeconds: number) => void;
  setDuration: (durationSeconds: number) => void;
  setError: (error: string) => void;
  enqueue: (track: Track) => void;
  dequeue: (trackId: string) => void;
  clearQueue: () => void;
  skipToNext: () => void;
};

export type PlaybackStore = PlaybackState & { actions: PlaybackActions };

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  status: "idle",
  positionSeconds: 0,
  durationSeconds: 0,
  error: undefined,

  actions: {
    play: (track) =>
      set({
        currentTrack: track,
        status: "loading",
        positionSeconds: 0,
        durationSeconds: track.durationSeconds ?? 0,
        error: undefined,
      }),

    pause: () => set({ status: "paused" }),

    resume: () => set({ status: "playing" }),

    seek: (positionSeconds) => set({ positionSeconds }),

    stop: () =>
      set({
        currentTrack: null,
        status: "idle",
        positionSeconds: 0,
        durationSeconds: 0,
      }),

    setStatus: (status) => set({ status }),

    setPosition: (positionSeconds) => set({ positionSeconds }),

    setDuration: (durationSeconds) => set({ durationSeconds }),

    setError: (error) => set({ status: "error", error }),

    enqueue: (track) =>
      set((state) => ({
        queue: [...state.queue, { track, addedAt: Date.now() }],
      })),

    dequeue: (trackId) =>
      set((state) => ({
        queue: state.queue.filter((item) => item.track.id !== trackId),
      })),

    clearQueue: () => set({ queue: [] }),

    skipToNext: () => {
      const { queue } = get();
      if (queue.length === 0) {
        get().actions.stop();
        return;
      }
      const [next, ...rest] = queue;
      set({ queue: rest });
      get().actions.play(next.track);
    },
  },
}));
