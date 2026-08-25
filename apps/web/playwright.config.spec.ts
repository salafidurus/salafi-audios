import { describe, expect, it } from "bun:test";

import {
  getDefaultWorkerCount,
  getPlaywrightPort,
  shouldReuseExistingServer,
} from "./playwright.config";

describe("Playwright web server lifecycle", () => {
  it("starts an isolated server by default", () => {
    expect(shouldReuseExistingServer({})).toBe(false);
  });

  it("reuses a server only with explicit opt-in", () => {
    expect(shouldReuseExistingServer({ PW_REUSE_EXISTING_SERVER: "1" })).toBe(true);
    expect(shouldReuseExistingServer({ PW_REUSE_EXISTING_SERVER: "0" })).toBe(false);
  });

  it("uses one worker by default and allows explicit parallelism", () => {
    expect(getDefaultWorkerCount({})).toBe(1);
    expect(getDefaultWorkerCount({ PW_WORKERS: "4" })).toBe(4);
  });

  it("uses the default port and accepts a valid explicit port", () => {
    expect(getPlaywrightPort({})).toBe(3008);
    expect(getPlaywrightPort({ PW_PORT: "3009" })).toBe(3009);
    expect(getPlaywrightPort({ PW_PORT: "invalid" })).toBe(3008);
  });
});
