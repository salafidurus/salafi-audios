import { z } from "zod";
import { create, type StoreApi, type UseBoundStore } from "zustand";

import type { StorageAdapter } from "../storage/storage-adapter";

/** Durable JSON-backed queue used to recover unsent personal-state intent. */
type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonValue };
/** JSON-safe payload accepted by the persisted outbox. */
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

/** Durable personal-state intent waiting to be delivered to the backend. */
export type OutboxEntry<TPayload extends JsonValue = JsonValue> = {
  /** Locally unique identifier used to remove or retry this entry. */
  id: string;
  /** Domain-specific operation label interpreted by the owning sync engine. */
  type: string;
  /** Serialized JSON-safe intent payload. */
  payload: TPayload;
  /** Client creation time, used for ordering and diagnostics. */
  createdAt: number;
  /** Number of failed delivery attempts retained for retry visibility. */
  retries: number;
};

type OutboxState<TPayload extends JsonValue> = {
  entries: OutboxEntry<TPayload>[];
  isDraining: boolean;
  actions: {
    enqueue: (type: string, payload: TPayload) => OutboxEntry<TPayload>;
    remove: (id: string) => void;
    incrementRetry: (id: string) => void;
    clear: () => void;
    setDraining: (isDraining: boolean) => void;
  };
};

type OutboxStore<TPayload extends JsonValue> = UseBoundStore<StoreApi<OutboxState<TPayload>>>;

/** Public outbox store and hydration lifecycle for a namespaced payload queue. */
export type Outbox<TPayload extends JsonValue = JsonValue> = {
  useOutboxStore: OutboxStore<TPayload>;
  /** Loads any entries persisted by a previous process/session into the store. */
  hydrate: () => Promise<void>;
};

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

const outboxEntrySchema = z.object({
  id: z.string(),
  type: z.string(),
  payload: jsonValueSchema,
  createdAt: z.number(),
  retries: z.number(),
});

const outboxEntriesSchema = z.array(outboxEntrySchema);

function parseOutboxEntries(raw: string): OutboxEntry<JsonValue>[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = outboxEntriesSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

function buildStore<TPayload extends JsonValue>(
  persist: (entries: OutboxEntry<TPayload>[]) => void,
  clearPersisted: () => void,
): OutboxStore<TPayload> {
  let idCounter = 0;

  return create<OutboxState<TPayload>>((set, get) => ({
    entries: [],
    isDraining: false,

    actions: {
      enqueue: (type, payload) => {
        const entry: OutboxEntry<TPayload> = {
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
export function createOutboxStore<TPayload extends JsonValue = JsonValue>(
  adapter: StorageAdapter,
  namespace: string,
): Outbox<TPayload> {
  const storageKey = `sd:outbox:${namespace}`;

  const useOutboxStore = buildStore<TPayload>(
    (entries) => void adapter.setItem(storageKey, JSON.stringify(entries)),
    () => void adapter.removeItem(storageKey),
  );

  async function hydrate(): Promise<void> {
    const raw = await adapter.getItem(storageKey);
    if (!raw) return;

    const entries = parseOutboxEntries(raw);
    if (entries === null) {
      await adapter.removeItem(storageKey);
      return;
    }

    // SAFETY: the payload was parsed as JSONValue entries and was previously
    // produced by this store, so the generic payload contract matches at runtime.
    useOutboxStore.setState({ entries: entries as OutboxEntry<TPayload>[] });
  }

  return { useOutboxStore, hydrate };
}
