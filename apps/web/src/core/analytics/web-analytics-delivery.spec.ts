import { describe, expect, it } from "bun:test";

import { AnalyticsBuffer } from "./analytics-buffer";
import { flushWebAnalytics } from "./web-analytics-delivery";

describe("flushWebAnalytics", () => {
  it("acknowledges accepted and deduplicated events without invoking auth failure handling", async () => {
    const buffer = new AnalyticsBuffer({
      now: () => 0,
      maxEvents: 10,
      maxBytes: 100_000,
      ttlMs: { critical: 100_000, important: 100_000, best_effort: 100_000 },
    });
    const event = {
      event_id: "event-1",
      event_name: "listing_viewed" as const,
      schema_version: "v1",
      occurred_at: "2026-01-01T00:00:00.000Z",
      app_version: "web-0.1.0",
      consent_state: "optional_granted" as const,
      identity: { type: "anonymous" as const, anonymous_id: "anonymous" },
      event_context: {},
      content_references: { listing_slug: "listing", scholar_slug: "scholar" },
      priority: "best_effort" as const,
      source: "web" as const,
      platform: "web" as const,
      authority: "client_observation" as const,
      producer: "web" as const,
      properties: {},
    };
    buffer.enqueue(event);
    const fetcher = async () =>
      new Response(JSON.stringify({ outcomes: [{ event_id: "event-1", status: "accepted" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    await flushWebAnalytics(buffer, { apiBaseUrl: "https://api.example.test", fetcher });

    expect(buffer.size).toBe(0);
  });

  it("retries transient responses with Retry-After and coalesces concurrent flushes", async () => {
    const buffer = new AnalyticsBuffer({
      now: () => 0,
      maxEvents: 10,
      maxBytes: 100_000,
      ttlMs: { critical: 100_000, important: 100_000, best_effort: 100_000 },
    });
    buffer.enqueue({
      event_id: "event-2",
      event_name: "listing_viewed",
      schema_version: "v1",
      occurred_at: "2026-01-01T00:00:00.000Z",
      app_version: "web-0.1.0",
      consent_state: "optional_granted",
      identity: { type: "anonymous", anonymous_id: "anonymous" },
      event_context: {},
      content_references: { listing_slug: "listing", scholar_slug: "scholar" },
      priority: "best_effort",
      source: "web",
      platform: "web",
      authority: "client_observation",
      producer: "web",
      properties: {},
    });
    let calls = 0;
    const waits: number[] = [];
    const fetcher = async () => {
      calls += 1;
      return calls === 1
        ? new Response(null, { status: 429, headers: { "Retry-After": "2" } })
        : new Response(
            JSON.stringify({ outcomes: [{ event_id: "event-2", status: "accepted" }] }),
            {
              status: 200,
              headers: { "content-type": "application/json" },
            },
          );
    };
    const options = {
      apiBaseUrl: "https://api.example.test",
      fetcher,
      wait: async (milliseconds: number) => void waits.push(milliseconds),
    };

    await Promise.all([flushWebAnalytics(buffer, options), flushWebAnalytics(buffer, options)]);

    expect(calls).toBe(2);
    expect(waits).toEqual([2_000]);
    expect(buffer.size).toBe(0);
  });
});
