import { describe, expect, it } from "bun:test";

import { DEFAULT_E2E_PORT, getE2EPort, getDiagnosticDirectory } from "./bun-webview-harness";

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
});

describe("Bun.WebView diagnostic paths", () => {
  it("normalizes the test identity into a stable artifact directory", () => {
    expect(getDiagnosticDirectory("home page / loads study landing")).toContain(
      "home-page-loads-study-landing",
    );
  });
});
