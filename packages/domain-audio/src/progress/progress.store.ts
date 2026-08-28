import { resolveLastWriteWins } from "@sd/core-sync";
import { create } from "zustand";

/** Local progress module for optimistic Listening continuity and reconciliation. */
/** Personal Listening position and completion state for one Listing. */
export type ListingProgress = {
  /** Client-facing Listing identity; not an internal database identifier. */
  listingSlug: string;
  /** Latest playback position in seconds. */
  positionSeconds: number;
  /** Track duration in seconds used to calculate continuity. */
  durationSeconds: number;
  /** Timestamp recorded when the track reaches natural completion. */
  completedAt?: string;
  /** Timestamp used to reconcile local and server representations. */
  updatedAt: string;
};

/** Progress reconciliation entity used by the shared sync engine. */
export type ProgressSyncEntity = ListingProgress & {
  id: string;
};

/**
 * Progress uses LWW for position, but completion is monotonic: once a client
 * has observed completion, a newer incomplete pull must not undo it.
 */
export function mergeProgress(
  current: ListingProgress | undefined,
  incoming: ListingProgress,
): ListingProgress {
  const resolved = resolveLastWriteWins(current, incoming);
  if (current?.completedAt && !resolved.completedAt) {
    return { ...resolved, completedAt: current.completedAt };
  }
  return resolved;
}

type ProgressState = {
  progressMap: Record<string, ListingProgress>;
  lastSyncedAt: string | null;
  actions: {
    setProgress: (listingSlug: string, positionSeconds: number, durationSeconds: number) => void;
    markCompleted: (listingSlug: string) => void;
    upsertProgress: (entry: ListingProgress) => void;
    loadProgress: (entries: ListingProgress[]) => void;
    getProgress: (listingSlug: string) => ListingProgress | undefined;
    setLastSyncedAt: (timestamp: string) => void;
  };
};

/** Reactive personal progress store used by playback and sync adapters. */
export const useProgressStore = create<ProgressState>((set, get) => ({
  progressMap: {},
  lastSyncedAt: null,

  actions: {
    setProgress: (listingSlug, positionSeconds, durationSeconds) =>
      set((state) => ({
        progressMap: {
          ...state.progressMap,
          [listingSlug]: {
            listingSlug,
            positionSeconds,
            durationSeconds,
            completedAt: state.progressMap[listingSlug]?.completedAt,
            updatedAt: new Date().toISOString(),
          },
        },
      })),

    markCompleted: (listingSlug) =>
      set((state) => {
        const existing = state.progressMap[listingSlug];
        if (!existing) return state;
        return {
          progressMap: {
            ...state.progressMap,
            [listingSlug]: {
              ...existing,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }),

    upsertProgress: (entry) =>
      set((state) => ({
        progressMap: { ...state.progressMap, [entry.listingSlug]: entry },
      })),

    // Last-write-wins by `updatedAt`, mirroring the server's own conflict-resolution
    // convention (AudioRepository.bulkSync) — a pulled entry never overwrites a newer
    // unsynced local edit still sitting in the outbox waiting to be pushed.
    loadProgress: (entries) =>
      set((state) => {
        const newMap = { ...state.progressMap };
        for (const entry of entries) {
          newMap[entry.listingSlug] = mergeProgress(newMap[entry.listingSlug], entry);
        }
        return { progressMap: newMap };
      }),

    getProgress: (listingSlug) => get().progressMap[listingSlug],

    setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
  },
}));
