import { create } from "zustand";

import type { StorageAdapter } from "../storage/storage-adapter";

export type OutboxEntry = {
  id: string;
  type: string;
  payload: unknown;
  createdAt: number;
  retries: number;
};

type OutboxState = {
  entries: OutboxEntry[];
  isDraining: boolean;
  actions: {
    enqueue: (type: string, payload: unknown) => OutboxEntry;
    remove: (id: string) => void;
    incrementRetry: (id: string) => void;
    clear: () => void;
    setDraining: (isDraining: boolean) => void;
  };
};

export type Outbox = {
  useOutboxStore: ReturnType<typeof buildStore>;
  /** Loads any entries persisted by a previous process/session into the store. */
  hydrate: () => Promise<void>;
};

function buildStore(persist: (entries: OutboxEntry[]) => void, clearPersisted: () => void) {
  let idCounter = 0;

  return create<OutboxState>((set, get) => ({
    entries: [],
    isDraining: false,

    actions: {
      enqueue: (type, payload) => {
        const entry: OutboxEntry = {
          id: `outbox-${Date.now()}-${idCounter++}`,
          type,
          payload,
          createdAt: Date.now(),
          retries: 0,
        };
        set((state) => ({ entries: [...state.entries, entry] }));
        persist(get().entries);
        return entry;
      },

      remove: (id) => {
        set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) }));
        persist(get().entries);
      },

      incrementRetry: (id) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, retries: entry.retries + 1 } : entry,
          ),
        }));
        persist(get().entries);
      },

      clear: () => {
        set({ entries: [] });
        clearPersisted();
      },

      setDraining: (isDraining) => set({ isDraining }),
    },
  }));
}

/**
 * Persisted outbox: unlike a plain in-memory queue (the gap in the original
 * native `outbox.store.ts`), every mutation is written through to `adapter` so
 * queued mutations survive an app restart/crash. `hydrate()` must be called
 * once at startup to recover anything left over from a previous session.
 */
export function createOutboxStore(adapter: StorageAdapter, namespace: string): Outbox {
  const storageKey = `sd:outbox:${namespace}`;

  const useOutboxStore = buildStore(
    (entries) => void adapter.setItem(storageKey, JSON.stringify(entries)),
    () => void adapter.removeItem(storageKey),
  );

  async function hydrate(): Promise<void> {
    const raw = await adapter.getItem(storageKey);
    if (!raw) return;

    try {
      const entries = JSON.parse(raw) as OutboxEntry[];
      useOutboxStore.setState({ entries });
    } catch {
      // Corrupted persisted payload — drop it rather than crash-loop on every read.
      await adapter.removeItem(storageKey);
    }
  }

  return { useOutboxStore, hydrate };
}
