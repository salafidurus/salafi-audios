/** Coordinates bounded browser event batches with the shared ingestion API. */
import type { CanonicalProductEvent } from "@sd/core-analytics";

import { endpoints } from "@sd/core-contracts";

import type { AnalyticsBuffer } from "./analytics-buffer";

/** Delivers browser event batches without coupling analytics to auth redirects. */

const BATCH_SIZE = 20;

/** Minimal response shape accepted from the append-only ingestion endpoint. */
interface IngestResponse {
  readonly outcomes?: readonly {
    event_id: string;
    /** Terminal or retryable disposition returned by ingestion. */
    status: string;
  }[];
}

/** Injectable delivery dependencies for browser and deterministic tests. */
export interface WebAnalyticsDeliveryOptions {
  readonly apiBaseUrl: string;
  readonly fetcher?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

/** Sends one coalesced batch and acknowledges only terminal server outcomes. */
export async function flushWebAnalytics(
  buffer: Pick<AnalyticsBuffer, "peek" | "acknowledge">,
  options: WebAnalyticsDeliveryOptions,
): Promise<void> {
  const batch = buffer.peek().slice(0, BATCH_SIZE);
  if (batch.length === 0) return;

  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(`${options.apiBaseUrl}${endpoints.analytics.events}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    // SAFETY: entries are typed canonical events when they enter the buffer.
    body: JSON.stringify({ events: batch.map(({ event }) => event as CanonicalProductEvent) }),
  });

  if (!response.ok) {
    acknowledgePermanentFailure(buffer, batch, response.status);
    return;
  }

  // SAFETY: the endpoint is required to return a JSON ingestion response.
  const body = (await response.json()) as IngestResponse;
  buffer.acknowledge(terminalEventIds(body));
}

function acknowledgePermanentFailure(
  buffer: Pick<AnalyticsBuffer, "acknowledge">,
  batch: readonly { event: CanonicalProductEvent }[],
  status: number,
): void {
  if (status === 400 || status === 401) {
    buffer.acknowledge(batch.map(({ event }) => event.event_id));
  }
}

function terminalEventIds(body: IngestResponse): string[] {
  const ids: string[] = [];
  for (const outcome of body.outcomes ?? []) {
    if (["accepted", "deduplicated", "dropped"].includes(outcome.status)) {
      ids.push(outcome.event_id);
    }
  }
  return ids;
}
