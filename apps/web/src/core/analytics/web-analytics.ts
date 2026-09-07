/** Creates provider-neutral web analytics events and queues them for delivery. */
import {
  parseProductEvent,
  type CanonicalProductEvent,
  type ProductEventContext,
} from "@sd/core-analytics";

import { hasWindow } from "@/shared/lib/runtime-guards";

import webPackage from "../../../package.json";
import { AnalyticsBuffer as AnalyticsBufferClass, type AnalyticsBuffer } from "./analytics-buffer";

/** Builds provider-neutral web observations and manages resettable browser identity. */

const ANONYMOUS_ID_KEY = "sd:analytics-anonymous-id:v1";
const SESSION_ID_KEY = "sd:analytics-session-id:v1";
let fallbackIdCounter = 0;

function getBrowserStorage(): WebAnalyticsRuntime["storage"] {
  if (!hasWindow()) return undefined;
  return window.localStorage;
}

/** Stable public content identity captured by a web observation. */
export interface WebAnalyticsContentReferences {
  /** Immutable public listing slug observed by the detail surface. */
  readonly listing_slug: string;
  /** Immutable public scholar slug associated with the listing. */
  readonly scholar_slug: string;
}

/** Listing and scholar identities attached to player observations. */
export type WebAudioAnalyticsReferences = WebAnalyticsContentReferences;

/** Recommendation context supplied by an API-owned discovery batch. */
export interface WebRecommendationAnalyticsContext {
  readonly surface: string;
  readonly position: number;
  readonly candidate_set_id: string;
  /** Backend-owned reason or strategy label for the candidate set. */
  readonly recommendation_source: string;
  readonly request_id?: string;
  /** Optional backend algorithm revision used to reproduce an exposure. */
  readonly algorithm_version?: string;
  readonly experiment_id?: string;
  /** Optional boolean treatment assignments; values contain no user identity. */
  readonly feature_flag_state?: Record<string, boolean>;
}

/** Search identity and privacy-safe context used by search observations. */
export interface WebSearchAnalyticsContext {
  readonly search_id: string;
  readonly query_length: number;
  /** Topic slugs selected when the search request was submitted. */
  readonly filter_slugs?: string[];
}

type DiscoveryEventProperties = {
  readonly search_id?: string;
  readonly query_length?: number;
  /** Topic filter identities selected for the privacy-safe search event. */
  readonly filter_slugs?: string[];
  readonly position?: number;
};

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
  readonly recordExploreOpened: () => void;
  readonly recordListingImpression: (
    references: WebAnalyticsContentReferences,
    recommendation?: WebRecommendationAnalyticsContext,
  ) => void;
  readonly recordScholarImpression: (
    scholar_slug: string,
    recommendation?: WebRecommendationAnalyticsContext,
  ) => void;
  readonly recordRecommendationImpression: (
    references: Partial<WebAnalyticsContentReferences>,
    recommendation: WebRecommendationAnalyticsContext,
  ) => void;
  readonly recordListingClicked: (references: WebAnalyticsContentReferences) => void;
  readonly recordScholarClicked: (scholar_slug: string) => void;
  readonly recordRecommendationClicked: (
    references: Partial<WebAnalyticsContentReferences>,
    recommendation?: WebRecommendationAnalyticsContext,
  ) => void;
  readonly recordScholarViewed: (scholar_slug: string) => void;
  readonly recordSearchSubmitted: (context: WebSearchAnalyticsContext) => void;
  readonly recordSearchResultSelected: (
    references: Partial<WebAnalyticsContentReferences>,
    search_id: string,
    position: number,
  ) => void;
  readonly recordListingViewed: (references: WebAnalyticsContentReferences) => void;
  readonly recordAudioStarted: (references: WebAudioAnalyticsReferences) => void;
  readonly recordAudioMilestone: (
    references: WebAudioAnalyticsReferences,
    milestone: 0.3 | 0.5 | 0.75,
  ) => void;
  readonly recordAudioCompletedObserved: (references: WebAudioAnalyticsReferences) => void;
  readonly withdrawConsent: () => void;
}

function id(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}-${uuid}`;

  const bytes = new Uint8Array(16);
  const getRandomValues = globalThis.crypto?.getRandomValues;
  if (getRandomValues) {
    getRandomValues.call(globalThis.crypto, bytes);
    const randomPart = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${prefix}-${Date.now()}-${randomPart}`;
  }

  return `${prefix}-${Date.now()}-${fallbackIdCounter++}`;
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
  const impressionKeys = new Set<string>();

  // oxlint-disable-next-line complexity -- This is the single provider-neutral construction boundary for the approved discovery event catalog.
  function recordDiscoveryEvent(
    eventName:
      | "explore_opened"
      | "listing_impression"
      | "scholar_impression"
      | "recommendation_impression"
      | "listing_clicked"
      | "scholar_clicked"
      | "recommendation_clicked"
      | "scholar_viewed"
      | "search_submitted"
      | "search_result_selected",
    contentReferences: Partial<WebAnalyticsContentReferences>,
    properties: DiscoveryEventProperties,
    recommendation?: WebRecommendationAnalyticsContext,
    dedupeKey?: string,
  ) {
    if (dedupeKey && impressionKeys.has(dedupeKey)) return;
    if (dedupeKey) impressionKeys.add(dedupeKey);
    const eventContext: ProductEventContext = {
      interface_language: runtime.language?.() || undefined,
      timezone: runtime.timezone?.() || undefined,
      session_id: getOrCreate(storage, SESSION_ID_KEY, "session"),
      source_surface: recommendation?.surface ?? "discovery",
    };
    if (recommendation) eventContext.recommendation = recommendation;
    // SAFETY: eventName is restricted to the approved discovery schemas and the parser validates the runtime payload before enqueueing.
    const event: CanonicalProductEvent = parseProductEvent({
      event_id: id("event"),
      event_name: eventName,
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
      event_context: eventContext,
      content_references: contentReferences,
      authority: "client_observation",
      producer: "web",
      priority: "best_effort",
      properties,
    } as Parameters<typeof parseProductEvent>[0]);
    if (buffer.enqueue(event)) runtime.onRecorded?.();
  }

  return {
    recordExploreOpened() {
      recordDiscoveryEvent("explore_opened", {}, {}, undefined, "explore_opened");
    },
    recordListingImpression(references, recommendation) {
      recordDiscoveryEvent(
        "listing_impression",
        references,
        {},
        recommendation,
        `listing_impression:${references.listing_slug}:${recommendation?.candidate_set_id ?? ""}:${recommendation?.position ?? ""}`,
      );
    },
    recordScholarImpression(scholar_slug, recommendation) {
      recordDiscoveryEvent(
        "scholar_impression",
        { scholar_slug },
        {},
        recommendation,
        `scholar_impression:${scholar_slug}:${recommendation?.candidate_set_id ?? ""}:${recommendation?.position ?? ""}`,
      );
    },
    recordRecommendationImpression(references, recommendation) {
      recordDiscoveryEvent(
        "recommendation_impression",
        references,
        {},
        recommendation,
        `recommendation_impression:${references.listing_slug ?? references.scholar_slug ?? ""}:${recommendation.candidate_set_id}:${recommendation.position}`,
      );
    },
    recordListingClicked(references) {
      recordDiscoveryEvent("listing_clicked", references, {});
    },
    recordScholarClicked(scholar_slug) {
      recordDiscoveryEvent("scholar_clicked", { scholar_slug }, {});
    },
    recordRecommendationClicked(references, recommendation) {
      recordDiscoveryEvent("recommendation_clicked", references, {}, recommendation);
    },
    recordScholarViewed(scholar_slug) {
      recordDiscoveryEvent("scholar_viewed", { scholar_slug }, {});
    },
    recordSearchSubmitted(context) {
      recordDiscoveryEvent(
        "search_submitted",
        {},
        context,
        undefined,
        `search_submitted:${context.search_id}`,
      );
    },
    recordSearchResultSelected(references, search_id, position) {
      recordDiscoveryEvent("search_result_selected", references, { search_id, position });
    },
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
          interface_language: runtime.language?.() || undefined,
          timezone: runtime.timezone?.() || undefined,
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
    recordAudioStarted(references) {
      recordAudioObservation(buffer, runtime, references, "audio_started", {});
    },
    recordAudioMilestone(references, milestone) {
      recordAudioObservation(buffer, runtime, references, "audio_milestone", {
        milestone_percent: milestone,
      });
    },
    recordAudioCompletedObserved(references) {
      recordAudioObservation(buffer, runtime, references, "audio_completed_observed", {});
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

function recordAudioObservation(
  buffer: Pick<AnalyticsBuffer, "enqueue">,
  runtime: WebAnalyticsRuntime,
  references: WebAudioAnalyticsReferences,
  eventName: "audio_started" | "audio_milestone" | "audio_completed_observed",
  properties: { milestone_percent?: 0.3 | 0.5 | 0.75 },
): void {
  const eventProperties =
    eventName === "audio_milestone"
      ? { milestone_percent: properties.milestone_percent ?? 0.3 }
      : {};
  // SAFETY: eventName is restricted to the three schemas below and milestone properties are selected by that discriminator.
  const event = parseProductEvent({
    event_id: id("event"),
    event_name: eventName,
    schema_version: "v1",
    occurred_at: new Date((runtime.now ?? Date.now)()).toISOString(),
    app_version: `web-${webPackage.version}`,
    source: "web",
    platform: "web",
    consent_state: "optional_granted",
    identity: {
      type: "anonymous",
      anonymous_id: getOrCreate(runtime.storage, ANONYMOUS_ID_KEY, "anonymous"),
    },
    event_context: {
      session_id: getOrCreate(runtime.storage, SESSION_ID_KEY, "session"),
      source_surface: "audio_player",
    },
    content_references: references,
    authority: "client_observation",
    producer: "web",
    priority: "best_effort",
    properties: eventProperties,
  } as Parameters<typeof parseProductEvent>[0]);
  if (buffer.enqueue(event)) runtime.onRecorded?.();
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
  storage: getBrowserStorage(),
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
  storage: getBrowserStorage(),
  language: () => document.documentElement.lang,
  timezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  onRecorded: () => {
    if (webAnalyticsBuffer.size >= 10) {
      for (const listener of webAnalyticsListeners) listener();
    }
  },
});
