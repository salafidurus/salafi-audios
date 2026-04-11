import { create } from "zustand";
import { httpClient } from "@sd/core-contracts";
import type { OutboxEntry } from "../types";

type OutboxState = {
  entries: OutboxEntry[];
  isDraining: boolean;
  actions: {
    enqueue: (type: string, payload: unknown) => void;
    drain: () => Promise<void>;
    remove: (id: string) => void;
    clear: () => void;
  };
};

let idCounter = 0;

export const useOutboxStore = create<OutboxState>((set, get) => ({
  entries: [],
  isDraining: false,

  actions: {
    enqueue: (type, payload) =>
      set((state) => ({
        entries: [
          ...state.entries,
          {
            id: `outbox-${Date.now()}-${idCounter++}`,
            type,
            payload,
            createdAt: Date.now(),
            retries: 0,
          },
        ],
      })),

    drain: async () => {
      const state = get();
      if (state.isDraining || state.entries.length === 0) return;

      set({ isDraining: true });

      const toProcess = [...state.entries];

      for (const entry of toProcess) {
        try {
          await httpClient({
            url: `/outbox/${entry.type}`,
            method: "POST",
            body: entry.payload,
          });
          get().actions.remove(entry.id);
        } catch {
          // Increment retry count, keep in queue
          set((s) => ({
            entries: s.entries.map((e) =>
              e.id === entry.id ? { ...e, retries: e.retries + 1 } : e,
            ),
          }));
        }
      }

      set({ isDraining: false });
    },

    remove: (id) =>
      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      })),

    clear: () => set({ entries: [] }),
  },
}));
