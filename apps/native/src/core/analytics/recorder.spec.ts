import { createFakeStorageAdapter } from "@sd/core-sync/test-utils";
import * as SecureStore from "expo-secure-store";

import { createAnalyticsBuffer } from "./buffer";
import { createNativeAnalyticsRecorder } from "./recorder";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue("anonymous-test"),
  setItemAsync: jest.fn(),
}));

describe("native analytics recorder", () => {
  it("queues lifecycle events with a resettable anonymous identity", async () => {
    const buffer = createAnalyticsBuffer(createFakeStorageAdapter(), () => 1000);
    await buffer.hydrate();
    const recorder = createNativeAnalyticsRecorder(buffer, () => 1000);

    await recorder.recordLifecycle("app_opened", "active");

    expect(buffer.entries()[0]?.event).toMatchObject({
      event_name: "app_opened",
      identity: { type: "anonymous", anonymous_id: "anonymous-test" },
      source: "native",
      authority: "client_observation",
    });
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("analytics.anonymous_id");
  });
});
