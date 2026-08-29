import { describe, expect, it } from "bun:test";

import {
  DEFAULT_E2E_PORT,
  getE2EPort,
  getE2EConfig,
  getDiagnosticDirectory,
  waitForBrowserCondition,
} from "./bun-webview-harness";
import { waitForSelector } from "./bun-webview-waits";

describe("Bun.WebView E2E configuration", () => {
  it("uses the dedicated default port", () => {
    expect(getE2EPort({})).toBe(DEFAULT_E2E_PORT);
  });

  it("accepts a valid isolated port", () => {
    expect(getE2EPort({ BUN_E2E_PORT: "3011" })).toBe(3011);
  });

  it("rejects malformed and out-of-range ports", () => {
    expect(getE2EPort({ BUN_E2E_PORT: "invalid" })).toBe(DEFAULT_E2E_PORT);
    expect(getE2EPort({ BUN_E2E_PORT: "0" })).toBe(DEFAULT_E2E_PORT);
    expect(getE2EPort({ BUN_E2E_PORT: "65536" })).toBe(DEFAULT_E2E_PORT);
  });

  it("uses the configured API origin instead of the web origin", () => {
    expect(
      getE2EConfig({ BUN_E2E_PORT: "3011", NEXT_PUBLIC_API_URL: "http://localhost:4000" }),
    ).toEqual({
      port: 3011,
      origin: "http://127.0.0.1:3011",
      apiOrigin: "http://localhost:4000",
      readyTimeoutMs: 120_000,
      skipBuild: false,
    });
  });
});

describe("Bun.WebView diagnostic paths", () => {
  it("normalizes the test identity into a stable artifact directory", () => {
    expect(getDiagnosticDirectory("home page / loads study landing")).toContain(
      "home-page-loads-study-landing",
    );
  });
});

describe("Bun.WebView application conditions", () => {
  it("exposes a bounded condition wait for browser journeys", async () => {
    const view = {
      evaluate: async () => true,
    } as unknown as Bun.WebView;

    await waitForBrowserCondition(view, "test condition", "true", { timeoutMs: 10 });
  });

  it("keeps dynamic wait literals inside the evaluated expression", async () => {
    const evaluatedConditions: string[] = [];
    const view = {
      evaluate: async (condition: string) => {
        evaluatedConditions.push(condition);
        return true;
      },
    } as unknown as Bun.WebView;

    const hostileSelector = `</script>${String.fromCharCode(0x2028)}'); alert('escaped`;
    await waitForSelector(view, hostileSelector, { timeoutMs: 10 });

    expect(evaluatedConditions[0]).toContain("\\u003C\\u002Fscript\\u003E");
    expect(evaluatedConditions[0]).toContain("\\u2028");
    expect(evaluatedConditions[0]).not.toContain("</script>");
  });
});
