import { describe, it, expect } from "bun:test";
import { fetchLatestVersion } from "./npm";

describe("fetchLatestVersion", () => {
  it("returns latest version for a real package", async () => {
    const version = await fetchLatestVersion("zod");
    expect(version).toBeTruthy();
    expect(version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("returns null for non-existent package", async () => {
    const version = await fetchLatestVersion("this-package-does-not-exist-12345");
    expect(version).toBeNull();
  });
});
