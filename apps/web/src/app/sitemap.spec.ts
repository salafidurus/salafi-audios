import { describe, it, expect, vi, afterEach } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns empty array when NODE_ENV is not production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(sitemap()).toEqual([]);
  });

  it("returns empty array in test environment", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(sitemap()).toEqual([]);
  });

  it("includes expected static pages in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_WEB_URL", "https://www.salafidurus.com");
    const result = sitemap();
    const urls = result.map((e) => e.url);
    expect(urls).toContain("https://www.salafidurus.com");
    expect(urls).toContain("https://www.salafidurus.com/search");
    expect(urls).toContain("https://www.salafidurus.com/explore");
    expect(urls).toContain("https://www.salafidurus.com/explore/recent");
    expect(urls).toContain("https://www.salafidurus.com/scholars");
    expect(urls).toContain("https://www.salafidurus.com/terms-of-use");
    expect(urls).toContain("https://www.salafidurus.com/privacy");
    expect(urls).toContain("https://www.salafidurus.com/support");
  });

  it("does not include auth-required routes like /explore/following", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_WEB_URL", "https://www.salafidurus.com");
    const urls = sitemap().map((e) => e.url);
    expect(urls).not.toContain("https://www.salafidurus.com/explore/following");
  });

  it("falls back to localhost when NEXT_PUBLIC_WEB_URL is not set", () => {
    vi.stubEnv("NODE_ENV", "production");
    const result = sitemap();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.url).toMatch(/^http:\/\/localhost:\d+/);
  });
});
