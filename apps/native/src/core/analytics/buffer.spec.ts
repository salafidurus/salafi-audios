import type { StorageAdapter } from "@sd/core-sync";

import { parseProductEvent, type CanonicalProductEvent } from "@sd/core-analytics";

import {
  ANALYTICS_BUFFER_MAX_BYTES,
  ANALYTICS_BUFFER_MAX_EVENTS,
  ANALYTICS_BUFFER_TTL_MS,
  createAnalyticsBuffer,
} from "./buffer";

function createMemoryAdapter(): StorageAdapter {
  let value: string | null = null;
  return {
    getItem: async () => value,
    setItem: async (_key, next) => {
      value = next;
    },
    removeItem: async () => {
      value = null;
    },
  };
}

function event(
  eventId: string,
  priority: "critical" | "important" | "best_effort" = "important",
  consentState: "essential" | "optional_granted" = "essential",
): CanonicalProductEvent {
  return parseProductEvent({
    event_id: eventId,
    event_name: "session_started",
    schema_version: "v1",
    occurred_at: "2026-09-06T12:00:00.000Z",
    source: "native",
    platform: "ios",
    app_version: "1.0.0",
    consent_state: consentState,
    identity: { type: "anonymous", anonymous_id: "anonymous-1" },
    event_context: {
      session_id: "session-1",
      lifecycle_state: "active",
    },
    content_references: {},
    priority,
    authority: "client_observation",
    producer: "native",
    properties: {},
  });
}

describe("native analytics buffer", () => {
  it("survives hydration through the injected persistent adapter", async () => {
    const adapter = createMemoryAdapter();
    const first = createAnalyticsBuffer(adapter);
    await first.enqueue(event("event-1"));

    const restarted = createAnalyticsBuffer(adapter);
    await restarted.hydrate();

    expect(restarted.entries().map((entry) => entry.event.event_id)).toEqual(["event-1"]);
  });

  it("evicts oldest low-priority entries when the event bound is exceeded", async () => {
    const adapter = createMemoryAdapter();
    const buffer = createAnalyticsBuffer(adapter);
    for (let index = 0; index < ANALYTICS_BUFFER_MAX_EVENTS + 1; index++) {
      await buffer.enqueue(event(`event-${index}`, "best_effort"));
    }
    await buffer.enqueue(event("important-event", "important"));

    expect(buffer.entries()).toHaveLength(ANALYTICS_BUFFER_MAX_EVENTS);
    expect(buffer.entries().some((entry) => entry.event.event_id === "important-event")).toBe(true);
    expect(buffer.entries().some((entry) => entry.event.event_id === "event-0")).toBe(false);
  });

  it("expires old entries and removes optional events without touching essential events", async () => {
    let now = 1_000_000;
    const adapter = createMemoryAdapter();
    const buffer = createAnalyticsBuffer(adapter, () => now);
    await buffer.enqueue(event("essential", "important", "essential"));
    await buffer.enqueue(event("optional", "important", "optional_granted"));

    await buffer.removeOptional();
    expect(buffer.entries().map((entry) => entry.event.event_id)).toEqual(["essential"]);

    now += ANALYTICS_BUFFER_TTL_MS;
    await buffer.hydrate();
    expect(buffer.entries()).toEqual([]);
  });

  it("keeps the serialized queue within the byte bound", async () => {
    const adapter = createMemoryAdapter();
    const buffer = createAnalyticsBuffer(adapter);
    for (let index = 0; index < 20; index++) {
      await buffer.enqueue(event(`event-${index}-${"x".repeat(40_000)}`, "best_effort"));
    }

    expect(
      new TextEncoder().encode(JSON.stringify(buffer.entries())).byteLength,
    ).toBeLessThanOrEqual(ANALYTICS_BUFFER_MAX_BYTES);
  });
});
