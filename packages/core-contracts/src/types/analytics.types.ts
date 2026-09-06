import { z } from "zod";

/** Per-event disposition returned by the append-only analytics ingestion API. */
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
