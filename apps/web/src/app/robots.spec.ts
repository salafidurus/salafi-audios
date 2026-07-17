import { describe, it, expect, afterEach } from "bun:test";
import robots from "./robots";

describe("robots", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("disallows all in development", () => {
    process.env.NODE_ENV = "development";
    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("disallows all on Vercel preview deployments", () => {
    process.env.NODE_ENV = "production";
    process.env.VERCEL_ENV = "preview";
    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("allows crawling with disallow paths in production", () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_WEB_URL = "https://www.salafidurus.com";
    process.env.NEXT_PUBLIC_API_URL = "https://api.salafidurus.com";
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
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_WEB_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    const result = robots();
    expect(result.sitemap).toBeDefined();
    expect(result.sitemap![0]).toMatch(/^http:\/\/localhost:\d+\/sitemap\.xml$/);
    expect(result.sitemap![1]).toMatch(/^http:\/\/localhost:\d+\/sitemap\.xml$/);
  });
});
