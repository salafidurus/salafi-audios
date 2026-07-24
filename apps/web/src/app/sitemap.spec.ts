import { describe, it, expect, afterEach } from "bun:test";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns empty array when NODE_ENV is not production", () => {
    (process.env as any).NODE_ENV = "development";
    expect(sitemap()).toEqual([]);
  });

  it("returns empty array in test environment", () => {
    (process.env as any).NODE_ENV = "test";
    expect(sitemap()).toEqual([]);
  });

  it("includes expected static pages in production", () => {
    (process.env as any).NODE_ENV = "production";
    process.env.NEXT_PUBLIC_WEB_URL = "https://www.salafidurus.com";
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

  it("does not include auth-required routes like /admin", () => {
    (process.env as any).NODE_ENV = "production";
    process.env.NEXT_PUBLIC_WEB_URL = "https://www.salafidurus.com";
    const urls = sitemap().map((e) => e.url);
    expect(urls).not.toContain("https://www.salafidurus.com/admin");
  });

  it("falls back to localhost when NEXT_PUBLIC_WEB_URL is not set", () => {
    (process.env as any).NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_WEB_URL;
    const result = sitemap();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.url).toMatch(/^http:\/\/localhost:\d+/);
  });
});
