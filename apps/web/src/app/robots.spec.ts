import { describe, it, expect, vi, afterEach } from "vitest";
import robots from "./robots";

describe("robots", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("disallows all in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("disallows all on Vercel preview deployments", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("allows crawling with disallow paths in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_WEB_URL", "https://www.salafidurus.com");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.salafidurus.com");
    const result = robots();
    expect(result).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/settings", "/sign-in", "/library", "/explore/following", "/auth"],
      },
      sitemap: [
        "https://www.salafidurus.com/sitemap.xml",
        "https://api.salafidurus.com/sitemap.xml",
      ],
    });
  });

  it("uses fallback URLs when env vars are not set", () => {
    vi.stubEnv("NODE_ENV", "production");
    const result = robots();
    expect(result.sitemap).toBeDefined();
    expect(result.sitemap![0]).toMatch(/^http:\/\/localhost:\d+\/sitemap\.xml$/);
    expect(result.sitemap![1]).toMatch(/^http:\/\/localhost:\d+\/sitemap\.xml$/);
  });
});
