import { create } from "zustand";
import type { LectureProgress } from "../types";

type ProgressState = {
  progressMap: Record<string, LectureProgress>;
  actions: {
    setProgress: (lectureId: string, positionSeconds: number, durationSeconds: number) => void;
    markCompleted: (lectureId: string) => void;
    loadProgress: (entries: LectureProgress[]) => void;
    getProgress: (lectureId: string) => LectureProgress | undefined;
  };
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressMap: {},

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
  },
}));
