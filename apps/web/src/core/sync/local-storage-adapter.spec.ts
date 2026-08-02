import "@/test-setup";
import { describe, it, expect, beforeEach } from "bun:test";

import { createLocalStorageAdapter } from "./local-storage-adapter";

describe("createLocalStorageAdapter", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null for a key that was never set", async () => {
    const adapter = createLocalStorageAdapter();

    expect(await adapter.getItem("missing")).toBeNull();
  });

  it("round-trips a value through setItem/getItem", async () => {
    const adapter = createLocalStorageAdapter();

    await adapter.setItem("k", "v");

    expect(await adapter.getItem("k")).toBe("v");
    expect(window.localStorage.getItem("k")).toBe("v");
  });

  it("removeItem deletes the key", async () => {
    const adapter = createLocalStorageAdapter();
    await adapter.setItem("k", "v");

    await adapter.removeItem("k");

    expect(await adapter.getItem("k")).toBeNull();
  });
});
