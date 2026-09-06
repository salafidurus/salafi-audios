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
});
