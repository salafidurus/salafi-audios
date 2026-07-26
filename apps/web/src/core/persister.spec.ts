import "@/test-setup";
import { describe, it, expect, vi } from "bun:test";
import { purgeQueryCacheDb, createIdbPersister } from "./persister";

describe("Web Query Cache Persister", () => {
  it("exports purgeQueryCacheDb function", () => {
    expect(typeof purgeQueryCacheDb).toBe("function");
  });

  it("purgeQueryCacheDb safely executes without throwing", async () => {
    await expect(purgeQueryCacheDb()).resolves.toBeUndefined();
  });

  it("createIdbPersister handles removeClient gracefully", async () => {
    const persister = createIdbPersister();
    expect(typeof persister.removeClient).toBe("function");
    await expect(persister.removeClient()).resolves.toBeUndefined();
  });
});
