/** Documents the browser event buffer's responsibility and delivery boundary. */
import {
  CanonicalProductEventSchema,
  type CanonicalProductEvent,
  type ProductEventPriority,
} from "@sd/core-analytics";
import { z } from "zod";

/** Retains browser-observed events under bounded expiry and priority policy. */

const PRIORITY_ORDER: ProductEventPriority[] = ["best_effort", "important", "critical"];

/** A canonical event plus the local timestamp used for retention decisions. */
export interface BufferedAnalyticsEvent {
  readonly event: CanonicalProductEvent;
  readonly queuedAt: number;
  readonly sizeBytes: number;
}

/** Configuration for the browser delivery buffer. */
export interface AnalyticsBufferOptions {
  readonly now?: () => number;
  readonly maxEvents: number;
  readonly maxBytes: number;
  readonly ttlMs: Record<ProductEventPriority, number>;
  /** Optional browser storage used to restore the queue across reloads. */
  readonly storage?: Pick<Storage, "getItem" | "setItem">;
  /** Versioned storage key for this queue. */
  readonly storageKey?: string;
}

/**
 * Bounded, priority-aware in-memory event queue.
 *
 * Expiry is evaluated when the queue is read or mutated. When capacity is
 * exceeded, expired events are removed first, followed by the oldest
 * best-effort and important events. Critical events are removed only when no
 * lower-priority event can make the queue fit.
 */
export class AnalyticsBuffer {
  private readonly now: () => number;
  private readonly maxEvents: number;
  private readonly maxBytes: number;
  private readonly ttlMs: Record<ProductEventPriority, number>;
  private readonly storage?: Pick<Storage, "getItem" | "setItem">;
  private readonly storageKey: string;
  private readonly entries: BufferedAnalyticsEvent[] = [];
  private totalBytes = 0;

  /** Creates an empty bounded buffer. */
  constructor(options: AnalyticsBufferOptions) {
    this.now = options.now ?? Date.now;
    this.maxEvents = options.maxEvents;
    this.maxBytes = options.maxBytes;
    this.ttlMs = options.ttlMs;
    this.storage = options.storage;
    this.storageKey = options.storageKey ?? "sd:analytics:buffer:v1";
  }

  /** Restores valid, bounded entries from browser storage without throwing. */
  hydrate(): void {
    if (!this.storage) return;
    try {
      const raw = this.storage.getItem(this.storageKey);
      const persisted: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(persisted)) return;
      this.entries.length = 0;
      this.totalBytes = 0;
      for (const item of persisted) {
        const parsed = PersistedEntrySchema.safeParse(item);
        if (!parsed.success) continue;
        const sizeBytes = new TextEncoder().encode(JSON.stringify(parsed.data.event)).byteLength;
        this.entries.push({ event: parsed.data.event, queuedAt: parsed.data.queuedAt, sizeBytes });
        this.totalBytes += sizeBytes;
      }
      this.removeExpired();
      this.evictUntilWithinLimits();
    } catch {
      this.entries.length = 0;
      this.totalBytes = 0;
    }
  }

  /** Number of currently retained events, after removing expired entries. */
  get size(): number {
    this.removeExpired();
    return this.entries.length;
  }

  /** Adds an event and applies retention and capacity policy. */
  enqueue(event: CanonicalProductEvent): boolean {
    this.removeExpired();
    const sizeBytes = new TextEncoder().encode(JSON.stringify(event)).byteLength;
    if (sizeBytes > this.maxBytes) {
      return false;
    }

    this.entries.push({ event, queuedAt: this.now(), sizeBytes });
    this.totalBytes += sizeBytes;
    this.evictUntilWithinLimits();
    this.persist();
    return this.entries.some((entry) => entry.event.event_id === event.event_id);
  }

  /** Returns retained events in FIFO order without removing them. */
  peek(): readonly BufferedAnalyticsEvent[] {
    this.removeExpired();
    return [...this.entries];
  }

  /** Removes the supplied event IDs after a terminal delivery result. */
  acknowledge(eventIds: readonly string[]): void {
    const ids = new Set(eventIds);
    for (let index = this.entries.length - 1; index >= 0; index -= 1) {
      const entry = this.entries[index];
      if (entry && ids.has(entry.event.event_id)) {
        this.removeAt(index);
      }
    }
    this.persist();
  }

  private removeExpired(): void {
    const currentTime = this.now();
    for (let index = this.entries.length - 1; index >= 0; index -= 1) {
      const entry = this.entries[index];
      if (!entry) {
        continue;
      }
      if (currentTime - entry.queuedAt >= this.ttlMs[entry.event.priority]) {
        this.removeAt(index);
      }
    }
  }

  private evictUntilWithinLimits(): void {
    while (this.entries.length > this.maxEvents || this.totalBytes > this.maxBytes) {
      const candidateIndex = this.findEvictionCandidate();
      if (candidateIndex === -1) {
        break;
      }
      this.removeAt(candidateIndex);
    }
  }

  private findEvictionCandidate(): number {
    for (const priority of PRIORITY_ORDER) {
      const oldestIndex = this.findOldestIndex(priority);
      if (oldestIndex !== -1) {
        return oldestIndex;
      }
    }
    return -1;
  }

  private findOldestIndex(priority: ProductEventPriority): number {
    const oldest = this.entries.reduce<{ index: number; queuedAt: number } | undefined>(
      (current, entry, index) =>
        entry.event.priority === priority && (!current || entry.queuedAt < current.queuedAt)
          ? { index, queuedAt: entry.queuedAt }
          : current,
      undefined,
    );
    return oldest?.index ?? -1;
  }

  private removeAt(index: number): void {
    const removed = this.entries[index];
    if (!removed) {
      return;
    }
    this.entries.splice(index, 1);
    this.totalBytes -= removed.sizeBytes;
  }

  private persist(): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(
        this.storageKey,
        JSON.stringify(this.entries.map(({ event, queuedAt }) => ({ event, queuedAt }))),
      );
    } catch {
      // Storage is best-effort; delivery remains available in memory.
    }
  }
}

const PersistedEntrySchema = z.strictObject({
  event: CanonicalProductEventSchema,
  queuedAt: z.number(),
});
