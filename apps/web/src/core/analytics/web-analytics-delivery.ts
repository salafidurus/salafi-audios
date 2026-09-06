/** Coordinates bounded browser event batches with the shared ingestion API. */
import type { CanonicalProductEvent } from "@sd/core-analytics";

import { endpoints } from "@sd/core-contracts";

import type { AnalyticsBuffer } from "./analytics-buffer";

/** Delivers browser event batches without coupling analytics to auth redirects. */

const BATCH_SIZE = 20;
const MAX_ATTEMPTS = 5;

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
  readonly wait?: (milliseconds: number) => Promise<void>;
}

let inFlight: Promise<void> | undefined;

/** Sends one coalesced batch and acknowledges only terminal server outcomes. */
export async function flushWebAnalytics(
  buffer: Pick<AnalyticsBuffer, "peek" | "acknowledge">,
  options: WebAnalyticsDeliveryOptions,
): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = flushBatch(buffer, options).finally(() => {
    inFlight = undefined;
  });
  return inFlight;
}

async function flushBatch(
  buffer: Pick<AnalyticsBuffer, "peek" | "acknowledge">,
  options: WebAnalyticsDeliveryOptions,
): Promise<void> {
  const batch = buffer.peek().slice(0, BATCH_SIZE);
  if (batch.length === 0) return;

  const fetcher = options.fetcher ?? fetch;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchBatch(fetcher, options.apiBaseUrl, batch);
      if (response.ok) {
        await acknowledgeResponse(buffer, response);
        return;
      }
      if (!isRetryableStatus(response.status)) {
        acknowledgePermanentFailure(buffer, batch, response.status);
        return;
      }
      await waitBeforeRetry(options.wait, attempt, response.headers.get("Retry-After"));
    } catch {
      await waitBeforeRetry(options.wait, attempt);
    }
  }
}

async function fetchBatch(
  fetcher: NonNullable<WebAnalyticsDeliveryOptions["fetcher"]>,
  apiBaseUrl: string,
  batch: readonly { event: CanonicalProductEvent }[],
): Promise<Response> {
  return fetcher(`${apiBaseUrl}${endpoints.analytics.events}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    // SAFETY: entries are typed canonical events when they enter the buffer.
    body: JSON.stringify({ events: batch.map(({ event }) => event as CanonicalProductEvent) }),
  });
}

async function acknowledgeResponse(
  buffer: Pick<AnalyticsBuffer, "acknowledge">,
  response: Response,
): Promise<void> {
  // SAFETY: the endpoint is required to return a JSON ingestion response.
  const body = (await response.json()) as IngestResponse;
  buffer.acknowledge(terminalEventIds(body));
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

async function waitBeforeRetry(
  wait: WebAnalyticsDeliveryOptions["wait"],
  attempt: number,
  retryAfter?: string | null,
): Promise<void> {
  const milliseconds = parseRetryAfter(retryAfter) ?? Math.min(16_000, 2 ** attempt * 1_000);
  await (wait ?? delay)(milliseconds);
}

function parseRetryAfter(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, Math.min(60_000, seconds * 1_000));
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp)
    ? undefined
    : Math.max(0, Math.min(60_000, timestamp - Date.now()));
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
