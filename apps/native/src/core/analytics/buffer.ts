import type { CanonicalProductEvent } from "@sd/core-analytics";
import type { StorageAdapter } from "@sd/core-sync";

/** Maximum number of canonical events retained by the native analytics buffer. */
export const ANALYTICS_BUFFER_MAX_EVENTS = 500;
/** Maximum serialized buffer size retained by the native analytics buffer. */
export const ANALYTICS_BUFFER_MAX_BYTES = 512 * 1024;
/** Maximum age of a buffered event before it is discarded. */
export const ANALYTICS_BUFFER_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const STORAGE_KEY = "sd:analytics:buffer";

type BufferedAnalyticsEvent = {
  event: CanonicalProductEvent;
  enqueuedAt: number;
  retries: number;
  nextAttemptAt: number;
};

/** Public read-only view of one queued event and its delivery metadata. */
export type AnalyticsBufferEntry = Readonly<BufferedAnalyticsEvent>;

function serializedBytes(entries: readonly AnalyticsBufferEntry[]): number {
  return new TextEncoder().encode(JSON.stringify(entries)).byteLength;
}

function isOptional(entry: AnalyticsBufferEntry): boolean {
  return entry.event.consent_state === "optional_granted";
}

function priorityRank(entry: AnalyticsBufferEntry): number {
  return { best_effort: 0, important: 1, critical: 2 }[entry.event.priority];
}

function parseEntries(raw: string | null): AnalyticsBufferEntry[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // SAFETY: persisted values are written by `persist`; malformed external
    // storage is isolated by the array check and discarded by later bounds.
    return parsed as AnalyticsBufferEntry[];
  } catch {
    return [];
  }
}

function removeExpired(
  entries: readonly AnalyticsBufferEntry[],
  now: number,
): AnalyticsBufferEntry[] {
  return entries.filter((entry) => now - entry.enqueuedAt < ANALYTICS_BUFFER_TTL_MS);
}

function enforceBounds(entries: AnalyticsBufferEntry[]): AnalyticsBufferEntry[] {
  const bounded = [...entries];
  while (
    bounded.length > ANALYTICS_BUFFER_MAX_EVENTS ||
    serializedBytes(bounded) > ANALYTICS_BUFFER_MAX_BYTES
  ) {
    const removableIndex = bounded.reduce((selected, entry, index, all) => {
      if (selected === -1) return index;
      const selectedEntry = all[selected];
      if (!selectedEntry) return selected;
      if (priorityRank(entry) < priorityRank(selectedEntry)) return index;
      if (
        priorityRank(entry) === priorityRank(selectedEntry) &&
        entry.enqueuedAt < selectedEntry.enqueuedAt
      ) {
        return index;
      }
      return selected;
    }, -1);

    if (removableIndex === -1) break;
    bounded.splice(removableIndex, 1);
  }
  return bounded;
}

/**
 * Owns native analytics persistence independently from personal-state and
 * download outboxes. Queue mutations are serialized through the injected
 * adapter and never perform network I/O.
 */
export type AnalyticsBuffer = {
  hydrate: () => Promise<void>;
  enqueue: (event: CanonicalProductEvent) => Promise<void>;
  entries: () => readonly AnalyticsBufferEntry[];
  remove: (eventIds: readonly string[]) => Promise<void>;
  removeOptional: () => Promise<void>;
  markRetry: (eventId: string, nextAttemptAt: number) => Promise<void>;
  markRetries: (retries: readonly { eventId: string; nextAttemptAt: number }[]) => Promise<void>;
};

/** Creates a bounded, restart-safe analytics buffer backed by native storage. */
export function createAnalyticsBuffer(
  adapter: StorageAdapter,
  now: () => number = Date.now,
): AnalyticsBuffer {
  let entries: AnalyticsBufferEntry[] = [];

  async function persist(next: AnalyticsBufferEntry[]): Promise<void> {
    entries = enforceBounds(removeExpired(next, now()));
    await adapter.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  return {
    async hydrate() {
      const hydrated = removeExpired(parseEntries(await adapter.getItem(STORAGE_KEY)), now());
      entries = enforceBounds(hydrated);
      await adapter.setItem(STORAGE_KEY, JSON.stringify(entries));
    },

    async enqueue(event) {
      await persist([...entries, { event, enqueuedAt: now(), retries: 0, nextAttemptAt: 0 }]);
    },

    entries: () => entries,

    async remove(eventIds) {
      const ids = new Set(eventIds);
      await persist(entries.filter((entry) => !ids.has(entry.event.event_id)));
    },

    async removeOptional() {
      await persist(entries.filter((entry) => !isOptional(entry)));
    },

    async markRetry(eventId, nextAttemptAt) {
      await persist(
        entries.map((entry) =>
          entry.event.event_id === eventId
            ? { ...entry, retries: entry.retries + 1, nextAttemptAt }
            : entry,
        ),
      );
    },

    async markRetries(retries) {
      const retryById = new Map(
        retries.map(({ eventId, nextAttemptAt }) => [eventId, nextAttemptAt]),
      );
      await persist(
        entries.map((entry) => {
          const nextAttemptAt = retryById.get(entry.event.event_id);
          return nextAttemptAt === undefined
            ? entry
            : { ...entry, retries: entry.retries + 1, nextAttemptAt };
        }),
      );
    },
  };
}
