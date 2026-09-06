import type { CanonicalProductEvent } from "@sd/core-analytics";

import { HttpError, httpClient } from "@sd/core-contracts/http";
import { createFakeStorageAdapter } from "@sd/core-sync/test-utils";

import { createAnalyticsBuffer } from "./buffer";
import { drainAnalyticsBuffer } from "./delivery";

jest.mock("@sd/core-contracts/http", () => {
  const actual =
    jest.requireActual<typeof import("@sd/core-contracts/http")>("@sd/core-contracts/http");
  return { ...actual, httpClient: jest.fn() };
});

const mockedHttpClient = jest.mocked(httpClient);

function event(eventId: string): CanonicalProductEvent {
  return {
    event_id: eventId,
    event_name: "session_started",
    schema_version: "v1",
    occurred_at: "2026-09-06T10:00:00.000Z",
    app_version: "1.0.0",
    source: "native",
    platform: "ios",
    consent_state: "essential",
    identity: { type: "anonymous", anonymous_id: "anonymous-1" },
    event_context: {
      session_id: "session-1",
      lifecycle_state: "active",
    },
    content_references: {},
    authority: "client_observation",
    producer: "native",
    priority: "critical",
    properties: {},
  };
}

describe("native analytics delivery", () => {
  beforeEach(() => jest.clearAllMocks());

  it("acknowledges accepted and deduplicated IDs", async () => {
    const buffer = createAnalyticsBuffer(createFakeStorageAdapter(), () => 1000);
    await buffer.hydrate();
    await buffer.enqueue(event("accepted"));
    await buffer.enqueue(event("duplicate"));
    mockedHttpClient.mockResolvedValue({
      outcomes: [
        { event_id: "accepted", status: "accepted" },
        { event_id: "duplicate", status: "deduplicated" },
      ],
    });

    await drainAnalyticsBuffer(buffer, () => 1000);

    expect(buffer.entries()).toHaveLength(0);
    expect(mockedHttpClient).toHaveBeenCalledWith(
      expect.objectContaining({ method: "POST", body: { events: expect.any(Array) } }),
    );
  });

  it("retains events after transient failures and drops permanent failures", async () => {
    const buffer = createAnalyticsBuffer(createFakeStorageAdapter(), () => 1000);
    await buffer.hydrate();
    await buffer.enqueue(event("transient"));
    mockedHttpClient.mockRejectedValueOnce(new Error("offline"));

    await drainAnalyticsBuffer(buffer, () => 1000);

    expect(buffer.entries()[0]?.retries).toBe(1);
    mockedHttpClient.mockRejectedValueOnce(new HttpError(400, "Bad Request", ""));
    await drainAnalyticsBuffer(buffer, () => 4000);
    expect(buffer.entries()).toHaveLength(0);
  });
});
