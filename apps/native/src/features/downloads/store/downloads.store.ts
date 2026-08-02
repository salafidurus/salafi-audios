import { create } from "zustand";

import {
  getAllDownloads,
  removeDownload as removeDownloadRow,
  upsertDownload as upsertDownloadRow,
  type DownloadRow,
} from "@/features/downloads/registry/downloads.db";

type UpsertInput = Partial<Omit<DownloadRow, "listingId" | "createdAt" | "updatedAt">> & {
  listingId: string;
};

type DownloadsState = {
  downloads: Record<string, DownloadRow>;
  actions: {
    /** Loads every row from the SQLite registry into this read-cache. Call once at startup. */
    hydrate: () => Promise<void>;
    /** Writes through to the registry, then updates this read-cache reactively. */
    upsert: (row: UpsertInput) => Promise<void>;
    remove: (listingId: string) => Promise<void>;
    getDownload: (listingId: string) => DownloadRow | undefined;
  };
};

/**
 * Reactive read-cache over the SQLite downloads registry. Previously this
 * store was the only source of truth and was purely in-memory (lost on
 * every app restart); it's now a cache that writes through `upsert`/`remove`
 * to `registry/downloads.db.ts`, which is what actually survives a restart.
 */
export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  downloads: {},

  actions: {
    hydrate: async () => {
      const rows = await getAllDownloads();
      set({ downloads: Object.fromEntries(rows.map((row) => [row.listingId, row])) });
    },

    upsert: async (row) => {
      await upsertDownloadRow(row);
      set((state) => ({
        downloads: {
          ...state.downloads,
          [row.listingId]: { ...state.downloads[row.listingId], ...row } as DownloadRow,
        },
      }));
    },

    remove: async (listingId) => {
      await removeDownloadRow(listingId);
      set((state) => {
        const { [listingId]: _removed, ...rest } = state.downloads;
        return { downloads: rest };
      });
    },

    getDownload: (listingId) => get().downloads[listingId],
  },
}));
