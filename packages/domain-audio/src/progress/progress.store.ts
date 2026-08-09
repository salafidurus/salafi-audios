import { resolveLastWriteWins } from "@sd/core-sync";
import { create } from "zustand";

export type ListingProgress = {
  listingId: string;
  positionSeconds: number;
  durationSeconds: number;
  completedAt?: string;
  updatedAt: string;
};

type ProgressState = {
  progressMap: Record<string, ListingProgress>;
  lastSyncedAt: string | null;
  actions: {
    setProgress: (listingId: string, positionSeconds: number, durationSeconds: number) => void;
    markCompleted: (listingId: string) => void;
    loadProgress: (entries: ListingProgress[]) => void;
    getProgress: (listingId: string) => ListingProgress | undefined;
    setLastSyncedAt: (timestamp: string) => void;
  };
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressMap: {},
  lastSyncedAt: null,

  actions: {
    setProgress: (listingId, positionSeconds, durationSeconds) =>
      set((state) => ({
        progressMap: {
          ...state.progressMap,
          [listingId]: {
            listingId,
            positionSeconds,
            durationSeconds,
            completedAt: state.progressMap[listingId]?.completedAt,
            updatedAt: new Date().toISOString(),
          },
        },
      })),

    markCompleted: (listingId) =>
      set((state) => {
        const existing = state.progressMap[listingId];
        if (!existing) return state;
        return {
          progressMap: {
            ...state.progressMap,
            [listingId]: {
              ...existing,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }),

    // Last-write-wins by `updatedAt`, mirroring the server's own conflict-resolution
    // convention (AudioRepository.bulkSync) — a pulled entry never overwrites a newer
    // unsynced local edit still sitting in the outbox waiting to be pushed.
    loadProgress: (entries) =>
      set((state) => {
        const newMap = { ...state.progressMap };
        for (const entry of entries) {
          newMap[entry.listingId] = resolveLastWriteWins(newMap[entry.listingId], entry);
        }
        return { progressMap: newMap };
      }),

    getProgress: (listingId) => get().progressMap[listingId],

    setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
  },
}));
