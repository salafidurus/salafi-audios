/** Documents the browser event buffer's responsibility and delivery boundary. */
import type { CanonicalProductEvent, ProductEventPriority } from "@sd/core-analytics";

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
  private readonly entries: BufferedAnalyticsEvent[] = [];
  private totalBytes = 0;

  /** Creates an empty bounded buffer. */
  constructor(options: AnalyticsBufferOptions) {
    this.now = options.now ?? Date.now;
    this.maxEvents = options.maxEvents;
    this.maxBytes = options.maxBytes;
    this.ttlMs = options.ttlMs;
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
}
