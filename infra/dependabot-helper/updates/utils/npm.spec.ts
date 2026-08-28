import { describe, it, expect } from "bun:test";

import { fetchLatestVersion } from "./npm";

describe("fetchLatestVersion", () => {
  it("returns the version from a successful registry response", async () => {
    const fetchFn = async (url: string) => {
      expect(url).toBe("https://registry.npmjs.org/zod/latest");
      return new Response(JSON.stringify({ version: "4.0.0" }), { status: 200 });
    };

    await expect(fetchLatestVersion("zod", fetchFn)).resolves.toBe("4.0.0");
  });

  it("returns null when the registry responds with a non-OK status", async () => {
    const fetchFn = async () => new Response("Not found", { status: 404 });

    await expect(fetchLatestVersion("missing-package", fetchFn)).resolves.toBeNull();
  });

  it("returns null when the registry request fails", async () => {
    const fetchFn = async () => {
      throw new Error("Network error");
    };

    await expect(fetchLatestVersion("zod", fetchFn)).resolves.toBeNull();
  });

  it("returns null when the registry response has no version", async () => {
    const fetchFn = async () => new Response(JSON.stringify({}), { status: 200 });

    await expect(fetchLatestVersion("zod", fetchFn)).resolves.toBeNull();
  });
});
