import type { Track } from "@sd/domain-audio";

import {
  parseProductEvent,
  type CanonicalProductEvent,
  type ProductEventContext,
} from "@sd/core-analytics";
import Constants from "expo-constants";
import { Platform } from "react-native";

import type { AnalyticsBuffer } from "./buffer";

import { createNativeAnalyticsContext, type NativeAnalyticsLifecycleState } from "./context";
import { getAnonymousAnalyticsId } from "./identity";

/** Construction and queuing of identity-safe native analytics events. */

/** Stable public content references supplied by a native feature event. */
export type NativeAnalyticsContentReferences = {
  /** Public listing slug associated with the observation, when applicable. */
  listing_slug?: string;
  /** Public scholar slug associated with the observation, when applicable. */
  scholar_slug?: string;
};

type NativeLifecycleEventName =
  | "app_opened"
  | "app_backgrounded"
  | "session_started"
  | "session_ended";

/** Recommendation context returned by the discovery API and echoed by clients. */
export type NativeRecommendationAnalyticsContext = {
  surface: string;
  position: number;
  candidate_set_id: string;
  /** Backend-owned reason or strategy label for the candidate set. */
  recommendation_source: string;
  request_id?: string;
  /** Optional backend algorithm revision used to reproduce an exposure. */
  algorithm_version?: string;
  experiment_id?: string;
  /** Optional boolean treatment assignments; values contain no user identity. */
  feature_flag_state?: Record<string, boolean>;
};

/** Privacy-safe search context; raw query text is deliberately excluded. */
export type NativeSearchAnalyticsContext = {
  search_id: string;
  query_length: number;
  /** Topic slugs selected when the search request was submitted. */
  filter_slugs?: string[];
};

/** Native analytics writer responsible for identity-safe canonical event construction. */
export type NativeAnalyticsRecorder = {
  recordLifecycle: (
    eventName: NativeLifecycleEventName,
    lifecycleState: NativeAnalyticsLifecycleState,
    contentReferences?: NativeAnalyticsContentReferences,
  ) => Promise<void>;
  recordAudioStarted: (track: Track) => Promise<void>;
  recordAudioMilestone: (track: Track, milestone: 0.3 | 0.5 | 0.75) => Promise<void>;
  recordAudioCompletedObserved: (track: Track) => Promise<void>;
  recordExploreOpened: () => Promise<void>;
  recordListingImpression: (
    references: NativeAnalyticsContentReferences,
    recommendation?: NativeRecommendationAnalyticsContext,
  ) => Promise<void>;
  recordScholarImpression: (
    scholar_slug: string,
    recommendation?: NativeRecommendationAnalyticsContext,
  ) => Promise<void>;
  recordRecommendationImpression: (
    references: NativeAnalyticsContentReferences,
    recommendation: NativeRecommendationAnalyticsContext,
  ) => Promise<void>;
  recordListingClicked: (references: NativeAnalyticsContentReferences) => Promise<void>;
  recordScholarClicked: (scholar_slug: string) => Promise<void>;
  recordRecommendationClicked: (
    references: NativeAnalyticsContentReferences,
    recommendation?: NativeRecommendationAnalyticsContext,
  ) => Promise<void>;
  recordScholarViewed: (scholar_slug: string) => Promise<void>;
  recordSearchSubmitted: (context: NativeSearchAnalyticsContext) => Promise<void>;
  recordSearchResultSelected: (
    references: NativeAnalyticsContentReferences,
    search_id: string,
    position: number,
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
  const impressionKeys = new Set<string>();

  // eslint-disable-next-line complexity -- one canonical construction boundary owns the approved discovery catalog.
  async function recordDiscoveryEvent(
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
    contentReferences: NativeAnalyticsContentReferences,
    properties: {
      search_id?: string;
      query_length?: number;
      /** Topic filter identities selected for the privacy-safe search event. */
      filter_slugs?: string[];
      position?: number;
    },
    recommendation?: NativeRecommendationAnalyticsContext,
    dedupeKey?: string,
  ): Promise<void> {
    if (dedupeKey && impressionKeys.has(dedupeKey)) return;
    if (dedupeKey) impressionKeys.add(dedupeKey);
    const eventContext: ProductEventContext = createNativeAnalyticsContext("active");
    if (recommendation) {
      eventContext.source_surface = recommendation.surface;
      eventContext.recommendation = recommendation;
    }
    // SAFETY: eventName and properties are restricted to the approved discovery catalog; parseProductEvent validates the final payload.
    const event = parseProductEvent({
      event_id: createEventId(now),
      event_name: eventName,
      schema_version: "v1",
      occurred_at: new Date(now()).toISOString(),
      app_version: Constants.expoConfig?.version ?? "unknown",
      source: "native",
      platform: Platform.OS === "ios" ? "ios" : "android",
      consent_state: "essential",
      identity: { type: "anonymous", anonymous_id: await getAnonymousAnalyticsId() },
      event_context: eventContext,
      content_references: contentReferences,
      authority: "client_observation",
      producer: "native",
      priority: "best_effort",
      properties,
    } as Parameters<typeof parseProductEvent>[0]);
    await buffer.enqueue(event);
  }

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
    async recordAudioStarted(track) {
      await recordAudioEvent(buffer, now, "audio_started", track, {});
    },
    async recordAudioMilestone(track, milestone) {
      await recordAudioEvent(buffer, now, "audio_milestone", track, {
        milestone_percent: milestone,
      });
    },
    async recordAudioCompletedObserved(track) {
      await recordAudioEvent(buffer, now, "audio_completed_observed", track, {});
    },
    recordExploreOpened: () =>
      recordDiscoveryEvent("explore_opened", {}, {}, undefined, "explore_opened"),
    recordListingImpression: (references, recommendation) =>
      recordDiscoveryEvent(
        "listing_impression",
        references,
        {},
        recommendation,
        `listing:${references.listing_slug}:${recommendation?.candidate_set_id ?? ""}:${recommendation?.position ?? ""}`,
      ),
    recordScholarImpression: (scholar_slug, recommendation) =>
      recordDiscoveryEvent(
        "scholar_impression",
        { scholar_slug },
        {},
        recommendation,
        `scholar:${scholar_slug}:${recommendation?.candidate_set_id ?? ""}:${recommendation?.position ?? ""}`,
      ),
    recordRecommendationImpression: (references, recommendation) =>
      recordDiscoveryEvent(
        "recommendation_impression",
        references,
        {},
        recommendation,
        `recommendation:${references.listing_slug ?? references.scholar_slug ?? ""}:${recommendation.candidate_set_id}:${recommendation.position}`,
      ),
    recordListingClicked: (references) => recordDiscoveryEvent("listing_clicked", references, {}),
    recordScholarClicked: (scholar_slug) =>
      recordDiscoveryEvent("scholar_clicked", { scholar_slug }, {}),
    recordRecommendationClicked: (references, recommendation) =>
      recordDiscoveryEvent("recommendation_clicked", references, {}, recommendation),
    recordScholarViewed: (scholar_slug) =>
      recordDiscoveryEvent("scholar_viewed", { scholar_slug }, {}),
    recordSearchSubmitted: (context) =>
      recordDiscoveryEvent(
        "search_submitted",
        {},
        context,
        undefined,
        `search:${context.search_id}`,
      ),
    recordSearchResultSelected: (references, search_id, position) =>
      recordDiscoveryEvent("search_result_selected", references, { search_id, position }),
  };
}

async function recordAudioEvent(
  buffer: AnalyticsBuffer,
  now: () => number,
  eventName: "audio_started" | "audio_milestone" | "audio_completed_observed",
  track: Track,
  properties: { milestone_percent?: 0.3 | 0.5 | 0.75 },
): Promise<void> {
  if (!track.scholarSlug) return;
  // SAFETY: eventName is restricted to the three schemas below and the milestone property is supplied only for audio_milestone.
  const event = parseProductEvent({
    event_id: createEventId(now),
    event_name: eventName,
    schema_version: "v1",
    occurred_at: new Date(now()).toISOString(),
    app_version: Constants.expoConfig?.version ?? "unknown",
    source: "native",
    platform: Platform.OS === "ios" ? "ios" : "android",
    consent_state: "essential",
    identity: { type: "anonymous", anonymous_id: await getAnonymousAnalyticsId() },
    event_context: { source_surface: "audio_player" },
    content_references: { listing_slug: track.slug, scholar_slug: track.scholarSlug },
    authority: "client_observation",
    producer: "native",
    priority: "best_effort",
    properties:
      eventName === "audio_milestone"
        ? { milestone_percent: properties.milestone_percent ?? 0.3 }
        : {},
  } as Parameters<typeof parseProductEvent>[0]);
  await buffer.enqueue(event);
}
