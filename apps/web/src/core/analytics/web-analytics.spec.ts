import { describe, expect, it } from "bun:test";

import { AnalyticsBuffer } from "./analytics-buffer";
import { createWebAnalyticsRecorder } from "./web-analytics";

describe("createWebAnalyticsRecorder", () => {
  it("captures immutable listing identity, browser context, and resettable IDs", () => {
    let now = 1_000;
    const values = new Map<string, string>();
    const buffer = new AnalyticsBuffer({
      now: () => now,
      maxEvents: 10,
      maxBytes: 100_000,
      ttlMs: { critical: 100_000, important: 100_000, best_effort: 100_000 },
    });
    const recorder = createWebAnalyticsRecorder(buffer, {
      now: () => now,
      storage: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => void values.set(key, value),
        removeItem: (key) => void values.delete(key),
      },
      language: () => "ar",
      timezone: () => "Asia/Riyadh",
    });

    recorder.recordListingViewed({ listing_slug: "lesson", scholar_slug: "teacher" });
    now += 1;
    recorder.recordListingViewed({ listing_slug: "other", scholar_slug: "teacher" });

    const [first, second] = buffer.peek();
    expect(first?.event.event_context).toMatchObject({
      interface_language: "ar",
      timezone: "Asia/Riyadh",
      source_surface: "listing_detail",
    });
    expect(first?.event.identity).toEqual(second?.event.identity);
    expect(first?.event.event_context.session_id).toBe(second?.event.event_context.session_id);
    expect(first?.event.content_references).toEqual({
      listing_slug: "lesson",
      scholar_slug: "teacher",
    });

    recorder.withdrawConsent();
    expect(buffer.size).toBe(0);
    expect(values.size).toBe(0);
  });
});
