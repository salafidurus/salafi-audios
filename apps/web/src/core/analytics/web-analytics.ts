/** Creates provider-neutral web analytics events and queues them for delivery. */
import { parseProductEvent, type CanonicalProductEvent } from "@sd/core-analytics";

import { hasWindow } from "@/shared/lib/runtime-guards";

import webPackage from "../../../package.json";
import { AnalyticsBuffer as AnalyticsBufferClass, type AnalyticsBuffer } from "./analytics-buffer";

/** Builds provider-neutral web observations and manages resettable browser identity. */

const ANONYMOUS_ID_KEY = "sd:analytics-anonymous-id:v1";
const SESSION_ID_KEY = "sd:analytics-session-id:v1";

/** Stable public content identity captured by a web observation. */
export interface WebAnalyticsContentReferences {
  /** Immutable public listing slug observed by the detail surface. */
  readonly listing_slug: string;
  /** Immutable public scholar slug associated with the listing. */
  readonly scholar_slug: string;
}

/** Browser dependencies used by the recorder, injectable for deterministic tests. */
export interface WebAnalyticsRuntime {
  readonly now?: () => number;
  readonly storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
  /** Returns the browser interface language at observation time. */
  readonly language?: () => string | undefined;
  readonly timezone?: () => string | undefined;
  /** Called after an event is accepted into the local queue. */
  readonly onRecorded?: () => void;
}

/** Recorder boundary for browser product observations. */
export interface WebAnalyticsRecorder {
  readonly recordListingViewed: (references: WebAnalyticsContentReferences) => void;
  readonly withdrawConsent: () => void;
}

function id(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid
    ? `${prefix}-${uuid}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreate(storage: WebAnalyticsRuntime["storage"], key: string, prefix: string): string {
  const existing = storage?.getItem(key);
  if (existing) return existing;
  const next = id(prefix);
  storage?.setItem(key, next);
  return next;
}

/** Builds and queues one immutable listing-view observation per caller request. */
export function createWebAnalyticsRecorder(
  buffer: Pick<AnalyticsBuffer, "enqueue" | "peek" | "acknowledge">,
  runtime: WebAnalyticsRuntime = {},
): WebAnalyticsRecorder {
  const now = runtime.now ?? Date.now;
  const storage = runtime.storage;

  return {
    recordListingViewed(references) {
      const event: CanonicalProductEvent = parseProductEvent({
        event_id: id("event"),
        event_name: "listing_viewed",
        schema_version: "v1",
        occurred_at: new Date(now()).toISOString(),
        app_version: `web-${webPackage.version}`,
        source: "web",
        platform: "web",
        consent_state: "optional_granted",
        identity: {
          type: "anonymous",
          anonymous_id: getOrCreate(storage, ANONYMOUS_ID_KEY, "anonymous"),
        },
        event_context: {
          interface_language: runtime.language?.(),
          timezone: runtime.timezone?.(),
          session_id: getOrCreate(storage, SESSION_ID_KEY, "session"),
          source_surface: "listing_detail",
        },
        content_references: references,
        authority: "client_observation",
        producer: "web",
        priority: "best_effort",
        properties: references,
      });
      if (buffer.enqueue(event)) runtime.onRecorded?.();
    },
    withdrawConsent() {
      const optionalIds: string[] = [];
      for (const entry of buffer.peek()) {
        if (entry.event.consent_state === "optional_granted") {
          optionalIds.push(entry.event.event_id);
        }
      }
      buffer.acknowledge(optionalIds);
      storage?.removeItem(ANONYMOUS_ID_KEY);
      storage?.removeItem(SESSION_ID_KEY);
    },
  };
}

/** Process-wide web queue shared by feature observers and lifecycle flushing. */
export const webAnalyticsBuffer = new AnalyticsBufferClass({
  maxEvents: 100,
  maxBytes: 512 * 1024,
  ttlMs: {
    critical: 7 * 24 * 60 * 60 * 1000,
    important: 24 * 60 * 60 * 1000,
    best_effort: 15 * 60 * 1000,
  },
  storage: hasWindow() ? window.localStorage : undefined,
  storageKey: "sd:analytics:buffer:v1",
});

const webAnalyticsListeners = new Set<() => void>();

/** Subscribes to local queue changes so runtime owners can trigger threshold flushes. */
export function subscribeWebAnalytics(listener: () => void): () => void {
  webAnalyticsListeners.add(listener);
  return () => webAnalyticsListeners.delete(listener);
}

/** Default consent-gated web recorder used by public web surfaces. */
export const webAnalytics = createWebAnalyticsRecorder(webAnalyticsBuffer, {
  storage: hasWindow() ? window.localStorage : undefined,
  language: () => document.documentElement.lang,
  timezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  onRecorded: () => {
    if (webAnalyticsBuffer.size >= 10) {
      for (const listener of webAnalyticsListeners) listener();
    }
  },
});
