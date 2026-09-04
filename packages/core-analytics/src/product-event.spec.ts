import { describe, expect, it } from "bun:test";

import {
  CanonicalProductEventSchema,
  parseProductEvent,
  ProductEventPrioritySchema,
  ProductEventSchema,
} from "./product-event";

const context = {
  interface_language: "en",
  preferred_language: "ar",
  content_language: "ar",
  audio_language: "ar",
  country_code: "SA",
  coarse_region: "riyadh",
  timezone: "Asia/Riyadh",
  source_surface: "recommendations",
};

const identity = {
  type: "anonymous" as const,
  anonymous_id: "anon-123",
};

describe("canonical product-event contract", () => {
  it("accepts a client observation with immutable slug references and context", () => {
    const result = ProductEventSchema.safeParse({
      event_id: "event-123",
      event_name: "listing_viewed",
      schema_version: "v1",
      occurred_at: "2026-09-03T12:00:00.000Z",
      received_at: "2026-09-03T12:00:01.000Z",
      source: "web",
      platform: "web",
      app_version: "web-2026.09.03",
      consent_state: "essential",
      identity,
      event_context: context,
      content_references: {
        listing_slug: "foundations-of-tawheed",
        scholar_slug: "salih-al-fawzan",
      },
      priority: "important",
      authority: "client_observation",
      producer: "web",
      properties: {
        listing_slug: "foundations-of-tawheed",
        scholar_slug: "salih-al-fawzan",
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a backend-confirmed outcome as a distinct typed event", () => {
    const result = ProductEventSchema.safeParse({
      event_id: "event-456",
      event_name: "audio_completed",
      schema_version: "v1",
      occurred_at: "2026-09-03T12:00:00.000Z",
      received_at: "2026-09-03T12:00:01.000Z",
      source: "api",
      platform: "web",
      app_version: "web-2026.09.03",
      consent_state: "essential",
      identity: {
        type: "authenticated",
        pseudonymous_id: "user-pseudo-123",
      },
      event_context: context,
      content_references: {
        listing_slug: "foundations-of-tawheed",
        scholar_slug: "salih-al-fawzan",
      },
      priority: "critical",
      authority: "backend_confirmed",
      producer: "api",
      properties: {
        completion_source: "progress_persisted",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required envelope fields and unsupported authority combinations", () => {
    const result = CanonicalProductEventSchema.safeParse({
      event_name: "listing_viewed",
      schema_version: "v1",
      occurred_at: "2026-09-03T12:00:00.000Z",
      received_at: "2026-09-03T12:00:01.000Z",
      source: "api",
      platform: "web",
      app_version: "web-2026.09.03",
      consent_state: "essential",
      identity,
      event_context: context,
      content_references: {},
      priority: "critical",
      authority: "backend_confirmed",
      producer: "api",
      properties: {
        listing_slug: "foundations-of-tawheed",
        scholar_slug: "salih-al-fawzan",
      },
    });

    expect(result.success).toBe(false);
  });

  it("exposes the three machine-checkable priority classes", () => {
    expect(ProductEventPrioritySchema.parse("critical")).toBe("critical");
    expect(ProductEventPrioritySchema.parse("important")).toBe("important");
    expect(ProductEventPrioritySchema.parse("best_effort")).toBe("best_effort");
  });

  it("preserves recommendation exposure context without defining a ranking algorithm", () => {
    const result = ProductEventSchema.safeParse({
      event_id: "event-recommendation",
      event_name: "listing_viewed",
      schema_version: "v1",
      occurred_at: "2026-09-03T12:00:00.000Z",
      received_at: "2026-09-03T12:00:01.000Z",
      source: "web",
      platform: "web",
      app_version: "web-2026.09.03",
      consent_state: "essential",
      identity,
      event_context: {
        ...context,
        recommendation: {
          request_id: "request-123",
          surface: "home",
          position: 0,
          candidate_set_id: "candidates-123",
          recommendation_source: "editorial",
          algorithm_version: "algorithm-v1",
          experiment_id: "experiment-a",
          feature_flag_state: { recommendations_v2: true },
        },
      },
      content_references: {
        listing_slug: "foundations-of-tawheed",
        scholar_slug: "salih-al-fawzan",
      },
      priority: "important",
      authority: "client_observation",
      producer: "web",
      properties: {},
    });

    expect(result.success).toBe(true);
  });

  it("rejects forbidden personal and exact-location properties", () => {
    const result = ProductEventSchema.safeParse({
      event_id: "event-forbidden",
      event_name: "listing_viewed",
      schema_version: "v1",
      occurred_at: "2026-09-03T12:00:00.000Z",
      received_at: "2026-09-03T12:00:01.000Z",
      source: "web",
      platform: "web",
      app_version: "web-2026.09.03",
      consent_state: "essential",
      identity,
      event_context: context,
      content_references: {
        listing_slug: "foundations-of-tawheed",
        scholar_slug: "salih-al-fawzan",
      },
      priority: "best_effort",
      authority: "client_observation",
      producer: "web",
      properties: {
        email: "student@example.com",
        nested: { exact_location: { latitude: 24.7, longitude: 46.7 } },
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects unsupported schema versions and payloads larger than 64 KiB", () => {
    const baseEvent = {
      event_id: "event-large",
      event_name: "listing_viewed" as const,
      schema_version: "v2",
      occurred_at: "2026-09-03T12:00:00.000Z",
      received_at: "2026-09-03T12:00:01.000Z",
      source: "web" as const,
      platform: "web" as const,
      app_version: "web-2026.09.03",
      consent_state: "essential" as const,
      identity,
      event_context: context,
      content_references: {
        listing_slug: "foundations-of-tawheed",
        scholar_slug: "salih-al-fawzan",
      },
      priority: "best_effort" as const,
      authority: "client_observation" as const,
      producer: "web" as const,
      properties: { listing_slug: "x".repeat(65 * 1024) },
    };

    expect(ProductEventSchema.safeParse(baseEvent).success).toBe(false);
    expect(ProductEventSchema.safeParse({ ...baseEvent, schema_version: "v1" }).success).toBe(
      false,
    );
  });

  it("returns deeply frozen canonical values from the public parser", () => {
    const event = parseProductEvent({
      event_id: "event-frozen",
      event_name: "listing_viewed",
      schema_version: "v1",
      occurred_at: "2026-09-03T12:00:00.000Z",
      received_at: "2026-09-03T12:00:01.000Z",
      source: "web",
      platform: "web",
      app_version: "web-2026.09.03",
      consent_state: "essential",
      identity,
      event_context: context,
      content_references: {
        listing_slug: "foundations-of-tawheed",
        scholar_slug: "salih-al-fawzan",
      },
      priority: "important",
      authority: "client_observation",
      producer: "web",
      properties: {},
    });

    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.event_context)).toBe(true);
    expect(Object.isFrozen(event.content_references)).toBe(true);
  });
});
