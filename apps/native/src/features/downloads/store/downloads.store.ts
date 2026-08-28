import { create } from "zustand";

import {
  getAllDownloads,
  removeDownload as removeDownloadRow,
  upsertDownload as upsertDownloadRow,
  type DownloadRow,
} from "@/features/downloads/registry/downloads.registry";

/** Provides the native features downloads store downloads.store module responsibility. */
type UpsertInput = Partial<Omit<DownloadRow, "listingSlug" | "createdAt" | "updatedAt">> & {
  /** Describes the listingSlug native field contract and behavior. */
  listingSlug: string;
};

type DownloadsState = {
  downloads: Record<string, DownloadRow>;
  actions: {
    /** Loads every row from the SQLite registry into this read-cache. Call once at startup. */
    hydrate: () => Promise<void>;
    /** Writes through to the registry, then updates this read-cache reactively. */
    upsert: (row: UpsertInput) => Promise<void>;
    remove: (listingSlug: string) => Promise<void>;
    getDownload: (listingSlug: string) => DownloadRow | undefined;
  };
};

/**
 * Reactive read-cache over the SQLite downloads registry. Previously this
 * store was the only source of truth and was purely in-memory (lost on
 * every app restart); it's now a cache that writes through `upsert`/`remove`
 * to `registry/downloads.registry.ts`, which is what actually survives a restart.
 */
export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  downloads: {},

  actions: {
    hydrate: async () => {
      const rows = await getAllDownloads();
      set({ downloads: Object.fromEntries(rows.map((row) => [row.listingSlug, row])) });
    },

    upsert: async (row) => {
      await upsertDownloadRow(row);
      set((state) => ({
        downloads: {
          ...state.downloads,
          // SAFETY: merging a partial write-through row onto an existing
          // DownloadRow preserves the persisted registry shape for that id.
          [row.listingSlug]: { ...state.downloads[row.listingSlug], ...row } as DownloadRow,
        },
      }));
    },

    remove: async (listingSlug) => {
      await removeDownloadRow(listingSlug);
      set((state) => {
        const { [listingSlug]: _removed, ...rest } = state.downloads;
        return { downloads: rest };
      });
    },

    getDownload: (listingSlug) => get().downloads[listingSlug],
  },
}));
