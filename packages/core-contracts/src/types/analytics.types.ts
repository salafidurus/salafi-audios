import { z } from "zod";

/** Shared validation and response contracts for analytics event ingestion. */
/**
 * Validates the server disposition for one submitted event. The strict shape
 * preserves the event ID needed for client acknowledgements and distinguishes
 * accepted, duplicate, and permanently dropped events from retryable failures.
 */
export const AnalyticsEventOutcomeSchema = z.strictObject({
  event_id: z.string().min(1),
  status: z.enum(["accepted", "deduplicated", "dropped"]),
  code: z.string().min(1).optional(),
});

/** Per-event ingestion result used by clients to acknowledge or retry safely. */
export type AnalyticsEventOutcome = z.infer<typeof AnalyticsEventOutcomeSchema>;

/** Shared response contract for a bounded analytics ingestion request. */
export const IngestAnalyticsEventsResponseSchema = z.strictObject({
  outcomes: z.array(AnalyticsEventOutcomeSchema),
});

/** API response for native and web analytics event delivery. */
export type IngestAnalyticsEventsResponse = z.infer<typeof IngestAnalyticsEventsResponseSchema>;
