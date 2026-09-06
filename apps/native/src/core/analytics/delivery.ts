import type { IngestAnalyticsEventsResponse } from "@sd/core-contracts";

import { endpoints, httpClient } from "@sd/core-contracts";
import { HttpError } from "@sd/core-contracts/http";

import type { AnalyticsBuffer, AnalyticsBufferEntry } from "./buffer";

/** Maximum number of events accepted by one analytics API request. */
export const ANALYTICS_DELIVERY_BATCH_SIZE = 20;
/** Number of transient delivery attempts before an event is abandoned. */
export const ANALYTICS_DELIVERY_MAX_RETRIES = 5;

function isTransientError(error: Error): boolean {
  return !(error instanceof HttpError) || error.status === 429 || error.status >= 500;
}

function retryDelay(retries: number): number {
  return Math.min(60 * 60 * 1000, 2 ** retries * 1000);
}

function dueEntries(entries: readonly AnalyticsBufferEntry[], now: number): AnalyticsBufferEntry[] {
  return entries
    .filter((entry) => entry.nextAttemptAt <= now)
    .sort((left, right) => left.enqueuedAt - right.enqueuedAt)
    .slice(0, ANALYTICS_DELIVERY_BATCH_SIZE);
}

function acknowledgedEventIds(response: IngestAnalyticsEventsResponse): Set<string> {
  const acknowledged = new Set<string>();
  for (const outcome of response.outcomes) {
    if (
      outcome.status === "accepted" ||
      outcome.status === "deduplicated" ||
      outcome.status === "dropped"
    ) {
      acknowledged.add(outcome.event_id);
    }
  }
  return acknowledged;
}

/**
 * Delivers one due native analytics batch and acknowledges only server-confirmed
 * event IDs. Transient failures retain stable IDs for bounded retry; permanent
 * client failures are dropped so one malformed event cannot block the queue.
 */
export async function drainAnalyticsBuffer(
  buffer: AnalyticsBuffer,
  now: () => number = Date.now,
): Promise<void> {
  const batch = dueEntries(buffer.entries(), now());
  if (batch.length === 0) return;

  try {
    const response = await httpClient<IngestAnalyticsEventsResponse>({
      url: endpoints.analytics.events,
      method: "POST",
      body: { events: batch.map((entry) => entry.event) },
    });
    const acknowledged = acknowledgedEventIds(response);
    await buffer.remove([...acknowledged]);

    const missing = batch.filter((entry) => !acknowledged.has(entry.event.event_id));
    await retryEntries(buffer, missing, now);
  } catch (error) {
    const permanent = error instanceof Error && !isTransientError(error);
    await handleDeliveryError(buffer, batch, permanent, now);
  }
}

async function handleDeliveryError(
  buffer: AnalyticsBuffer,
  batch: readonly AnalyticsBufferEntry[],
  permanent: boolean,
  now: () => number,
): Promise<void> {
  if (permanent) {
    await buffer.remove(batch.map((entry) => entry.event.event_id));
    return;
  }
  await retryEntries(buffer, batch, now);
}

async function retryEntries(
  buffer: AnalyticsBuffer,
  entries: readonly AnalyticsBufferEntry[],
  now: () => number,
): Promise<void> {
  const nextAttemptAt = now();
  const retryUpdates: Array<{ eventId: string; nextAttemptAt: number }> = [];
  const abandonedIds: string[] = [];
  for (const entry of entries) {
    if (entry.retries + 1 >= ANALYTICS_DELIVERY_MAX_RETRIES) {
      abandonedIds.push(entry.event.event_id);
      continue;
    }
    retryUpdates.push({
      eventId: entry.event.event_id,
      nextAttemptAt: nextAttemptAt + retryDelay(entry.retries),
    });
  }
  await buffer.remove(abandonedIds);
  await buffer.markRetries(retryUpdates);
}
