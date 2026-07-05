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
  /** Map of listingId → savedAt ISO string */
  savedMap: Record<string, string>;
  lastSyncedAt: string | null;
  actions: {
    setProgress: (listingId: string, positionSeconds: number, durationSeconds: number) => void;
    markCompleted: (listingId: string) => void;
    loadProgress: (entries: ListingProgress[]) => void;
    getProgress: (listingId: string) => ListingProgress | undefined;
    setLastSyncedAt: (timestamp: string) => void;
    addSaved: (listingId: string) => void;
    removeSaved: (listingId: string) => void;
    isSaved: (listingId: string) => boolean;
    getSavedIds: () => string[];
    loadSaved: (entries: Array<{ listingId: string; savedAt: string }>) => void;
  };
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressMap: {},
  savedMap: {},
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

    loadProgress: (entries) =>
      set((state) => {
        const newMap = { ...state.progressMap };
        for (const entry of entries) {
          newMap[entry.listingId] = entry;
        }
        return { progressMap: newMap };
      }),

    getProgress: (listingId) => get().progressMap[listingId],

    setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),

    addSaved: (listingId) =>
      set((state) => ({
        savedMap: {
          ...state.savedMap,
          [listingId]: new Date().toISOString(),
        },
      })),

    removeSaved: (listingId) =>
      set((state) => {
        const { [listingId]: _, ...rest } = state.savedMap;
        return { savedMap: rest };
      }),

    isSaved: (listingId) => listingId in get().savedMap,

    getSavedIds: () => Object.keys(get().savedMap),

    loadSaved: (entries) =>
      set((state) => {
        const newMap = { ...state.savedMap };
        for (const entry of entries) {
          newMap[entry.listingId] = entry.savedAt;
        }
        return { savedMap: newMap };
      }),
  },
}));
