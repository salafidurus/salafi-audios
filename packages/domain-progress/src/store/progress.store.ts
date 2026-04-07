import { create } from "zustand";
import type { LectureProgress } from "../types";

type ProgressState = {
  progressMap: Record<string, LectureProgress>;
  /** Map of lectureId → savedAt ISO string */
  savedMap: Record<string, string>;
  actions: {
    setProgress: (lectureId: string, positionSeconds: number, durationSeconds: number) => void;
    markCompleted: (lectureId: string) => void;
    loadProgress: (entries: LectureProgress[]) => void;
    getProgress: (lectureId: string) => LectureProgress | undefined;
    addSaved: (lectureId: string) => void;
    removeSaved: (lectureId: string) => void;
    isSaved: (lectureId: string) => boolean;
    getSavedIds: () => string[];
    loadSaved: (entries: Array<{ lectureId: string; savedAt: string }>) => void;
  };
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressMap: {},
  savedMap: {},

  actions: {
    setProgress: (lectureId, positionSeconds, durationSeconds) =>
      set((state) => ({
        progressMap: {
          ...state.progressMap,
          [lectureId]: {
            lectureId,
            positionSeconds,
            durationSeconds,
            completedAt: state.progressMap[lectureId]?.completedAt,
            updatedAt: new Date().toISOString(),
          },
        },
      })),

    markCompleted: (lectureId) =>
      set((state) => {
        const existing = state.progressMap[lectureId];
        if (!existing) return state;
        return {
          progressMap: {
            ...state.progressMap,
            [lectureId]: {
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
          newMap[entry.lectureId] = entry;
        }
        return { progressMap: newMap };
      }),

    getProgress: (lectureId) => get().progressMap[lectureId],

    addSaved: (lectureId) =>
      set((state) => ({
        savedMap: {
          ...state.savedMap,
          [lectureId]: new Date().toISOString(),
        },
      })),

    removeSaved: (lectureId) =>
      set((state) => {
        const { [lectureId]: _, ...rest } = state.savedMap;
        return { savedMap: rest };
      }),

    isSaved: (lectureId) => lectureId in get().savedMap,

    getSavedIds: () => Object.keys(get().savedMap),

    loadSaved: (entries) =>
      set((state) => {
        const newMap = { ...state.savedMap };
        for (const entry of entries) {
          newMap[entry.lectureId] = entry.savedAt;
        }
        return { savedMap: newMap };
      }),
  },
}));
