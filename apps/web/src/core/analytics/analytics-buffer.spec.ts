import type { CanonicalProductEvent } from "@sd/core-analytics";

import { describe, expect, it } from "bun:test";

import { AnalyticsBuffer } from "./analytics-buffer";

const event = (
  eventId: string,
  priority: CanonicalProductEvent["priority"],
): CanonicalProductEvent => ({
  event_id: eventId,
  event_name: "listing_viewed",
  schema_version: "v1",
  occurred_at: "2026-01-01T00:00:00.000Z",
  app_version: "web-0.1.0",
  consent_state: "optional_granted",
  identity: { type: "anonymous", anonymous_id: "anonymous-id" },
  event_context: { source_surface: "listing_detail" },
  content_references: { listing_slug: "listing", scholar_slug: "scholar" },
  priority,
  source: "web",
  platform: "web",
  authority: "client_observation",
  producer: "web",
  properties: { listing_slug: "listing", scholar_slug: "scholar" },
});

describe("AnalyticsBuffer", () => {
  it("expires entries by priority TTL and evicts best-effort before important entries", () => {
    let now = 0;
    const buffer = new AnalyticsBuffer({
      now: () => now,
      maxEvents: 3,
      maxBytes: 100_000,
      ttlMs: {
        critical: 7 * 24 * 60 * 60 * 1000,
        important: 24 * 60 * 60 * 1000,
        best_effort: 15 * 60 * 1000,
      },
    });

    buffer.enqueue(event("critical", "critical"));
    buffer.enqueue(event("important", "important"));
    buffer.enqueue(event("best-effort", "best_effort"));

    now = 16 * 60 * 1000;
    buffer.enqueue(event("new-important", "important"));

    expect(buffer.peek().map((item) => item.event.event_id)).toEqual([
      "critical",
      "important",
      "new-important",
    ]);
  });

  it("drops expired entries before returning a batch", () => {
    let now = 0;
    const buffer = new AnalyticsBuffer({
      now: () => now,
      maxEvents: 10,
      maxBytes: 100_000,
      ttlMs: { critical: 100, important: 100, best_effort: 100 },
    });

    buffer.enqueue(event("expired", "important"));
    now = 101;

    expect(buffer.peek()).toEqual([]);
    expect(buffer.size).toBe(0);
  });
});
