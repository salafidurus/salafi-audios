import { parseProductEvent, type CanonicalProductEvent } from "@sd/core-analytics";
import Constants from "expo-constants";
import { Platform } from "react-native";

import type { AnalyticsBuffer } from "./buffer";

import { createNativeAnalyticsContext, type NativeAnalyticsLifecycleState } from "./context";
import { getAnonymousAnalyticsId } from "./identity";

/** Stable public content references supplied by a native feature event. */
export type NativeAnalyticsContentReferences = {
  listing_slug?: string;
  scholar_slug?: string;
};

type NativeLifecycleEventName =
  | "app_opened"
  | "app_backgrounded"
  | "session_started"
  | "session_ended";

/** Native analytics writer responsible for identity-safe canonical event construction. */
export type NativeAnalyticsRecorder = {
  recordLifecycle: (
    eventName: NativeLifecycleEventName,
    lifecycleState: NativeAnalyticsLifecycleState,
    contentReferences?: NativeAnalyticsContentReferences,
  ) => Promise<void>;
};

function createEventId(now: () => number): string {
  return `event-${now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Creates a native recorder that validates and queues events without exposing
 * authenticated database IDs or performing network I/O on the calling path.
 */
export function createNativeAnalyticsRecorder(
  buffer: AnalyticsBuffer,
  now: () => number = Date.now,
): NativeAnalyticsRecorder {
  return {
    async recordLifecycle(eventName, lifecycleState, contentReferences = {}) {
      const eventContext = createNativeAnalyticsContext(lifecycleState);
      const platform = Platform.OS === "ios" ? "ios" : "android";
      const event: CanonicalProductEvent = parseProductEvent({
        event_id: createEventId(now),
        event_name: eventName,
        schema_version: "v1",
        occurred_at: new Date(now()).toISOString(),
        app_version: Constants.expoConfig?.version ?? "unknown",
        source: "native",
        platform,
        consent_state: "essential",
        identity: { type: "anonymous", anonymous_id: await getAnonymousAnalyticsId() },
        event_context: eventContext,
        content_references: contentReferences,
        authority: "client_observation",
        producer: "native",
        priority: "critical",
        properties: {},
      });
      await buffer.enqueue(event);
    },
  };
}
