import { create } from "zustand";
import type { DownloadItem } from "../types";

type DownloadsState = {
  downloads: Record<string, DownloadItem>;
  actions: {
    startDownload: (lectureId: string) => void;
    setProgress: (lectureId: string, progress: number) => void;
    setComplete: (lectureId: string, localUri: string) => void;
    setError: (lectureId: string, error: string) => void;
    removeDownload: (lectureId: string) => void;
    getDownload: (lectureId: string) => DownloadItem | undefined;
  };
};

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  downloads: {},

  actions: {
    startDownload: (lectureId) =>
      set((state) => ({
        downloads: {
          ...state.downloads,
          [lectureId]: {
            lectureId,
            status: "pending",
            progress: 0,
            startedAt: Date.now(),
          },
        },
      })),

    setProgress: (lectureId, progress) =>
      set((state) => {
        const dl = state.downloads[lectureId];
        if (!dl) return state;
        return {
          downloads: {
            ...state.downloads,
            [lectureId]: { ...dl, status: "downloading", progress },
          },
        };
      }),

    setComplete: (lectureId, localUri) =>
      set((state) => {
        const dl = state.downloads[lectureId];
        if (!dl) return state;
        return {
          downloads: {
            ...state.downloads,
            [lectureId]: {
              ...dl,
              status: "complete",
              progress: 100,
              localUri,
              completedAt: Date.now(),
            },
          },
        };
      }),

    setError: (lectureId, error) =>
      set((state) => {
        const dl = state.downloads[lectureId];
        if (!dl) return state;
        return {
          downloads: {
            ...state.downloads,
            [lectureId]: { ...dl, status: "error", error },
          },
        };
      }),

    removeDownload: (lectureId) =>
      set((state) => {
        const { [lectureId]: _, ...rest } = state.downloads;
        return { downloads: rest };
      }),

    getDownload: (lectureId) => get().downloads[lectureId],
  },
}));
