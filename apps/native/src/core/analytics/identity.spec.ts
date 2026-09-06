import * as SecureStore from "expo-secure-store";

import { getAnonymousAnalyticsId, resetAnonymousAnalyticsId } from "./identity";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const getItemAsync = jest.mocked(SecureStore.getItemAsync);
const setItemAsync = jest.mocked(SecureStore.setItemAsync);

describe("native anonymous analytics identity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reuses the persisted identity", async () => {
    getItemAsync.mockResolvedValue("anonymous-existing");

    await expect(getAnonymousAnalyticsId()).resolves.toBe("anonymous-existing");
    expect(setItemAsync).not.toHaveBeenCalled();
  });

  it("persists a new identity when none exists", async () => {
    getItemAsync.mockResolvedValue(null);

    const identity = await getAnonymousAnalyticsId();

    expect(identity).toMatch(/^anonymous-/);
    expect(setItemAsync).toHaveBeenCalledWith("analytics.anonymous_id", identity);
  });

  it("replaces the identity without reading or linking the previous value", async () => {
    const identity = await resetAnonymousAnalyticsId();

    expect(identity).toMatch(/^anonymous-/);
    expect(getItemAsync).not.toHaveBeenCalled();
    expect(setItemAsync).toHaveBeenCalledWith("analytics.anonymous_id", identity);
  });
});
