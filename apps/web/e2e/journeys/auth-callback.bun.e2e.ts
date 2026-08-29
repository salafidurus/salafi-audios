import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { installAuthFixtures } from "../support/bun-webview-auth-fixtures";
import {
  getE2EConfig,
  startWebServer,
  waitForBrowserCondition,
  waitForWebReady,
  withBrowserJourney,
  type E2EConfig,
  type WebServer,
} from "../support/bun-webview-harness";

async function waitForHeading(view: Bun.WebView, text: string) {
  await view.evaluate(`new Promise((resolve, reject) => {
    const deadline = Date.now() + 20000;
    const check = () => {
      if ([...document.querySelectorAll('h1, h2')].some((heading) => heading.textContent?.includes(${JSON.stringify(text)}))) {
        resolve(true);
      } else if (Date.now() >= deadline) {
        reject(new Error('Timed out waiting for heading: ' + ${JSON.stringify(text)}));
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  })`);
}

async function waitForText(view: Bun.WebView, text: string) {
  await waitForBrowserCondition(
    view,
    `visible text: ${text}`,
    `document.body.textContent?.includes(${JSON.stringify(text)}) === true`,
    { timeoutMs: 20_000 },
  );
}

async function waitForPath(view: Bun.WebView, path: string) {
  await waitForBrowserCondition(
    view,
    `path: ${path}`,
    `location.pathname + location.search === ${JSON.stringify(path)}`,
    { timeoutMs: 20_000 },
  );
}

describe("authentication callback Bun.WebView journeys", () => {
  let config: E2EConfig;
  let server: WebServer | undefined;

  beforeAll(async () => {
    config = getE2EConfig({ ...process.env, BUN_E2E_PORT: process.env.BUN_E2E_PORT ?? "3012" });
    server = await startWebServer(config);
    await waitForWebReady(config.origin);
  });

  afterAll(async () => {
    await server?.stop();
  });

  it("renders callback loading state inside the public shell", async () => {
    await withBrowserJourney("callback loading state", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey, { sessionDelayMs: 500 });
      try {
        await journey.view.navigate(`${config.origin}/auth/callback?redirect=/explore`);
        await waitForText(journey.view, "Completing sign-in...");
        const state = await journey.view.evaluate<{ main: number; text: string }>(
          `({ main: document.querySelectorAll('main').length, text: document.body.textContent ?? '' })`,
        );
        expect(state.main).toBe(1);
        expect(state.text).toContain("Completing sign-in...");
      } finally {
        await cleanup();
      }
    });
  });

  it("shows timeout recovery when session verification does not finish", async () => {
    await withBrowserJourney("callback timeout recovery", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey, { sessionDelayMs: 11000 });
      try {
        await journey.view.navigate(`${config.origin}/auth/callback`);
        await waitForHeading(journey.view, "Authentication Timeout");
        expect(journey.view.url).toContain("/auth/callback");
      } finally {
        await cleanup();
      }
    });
  });

  it("shows sign-in recovery when session verification fails", async () => {
    await withBrowserJourney("callback error recovery", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey, { sessionStatus: 500 });
      try {
        await journey.view.navigate(`${config.origin}/auth/callback`);
        await waitForHeading(journey.view, "Authentication Error");
        expect(await journey.view.evaluate("document.body.textContent ?? ''")).toContain(
          "Try again",
        );
      } finally {
        await cleanup();
      }
    });
  });

  it("redirects a verified session to a safe relative destination", async () => {
    await withBrowserJourney("callback successful redirect", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey, { role: "listener" });
      try {
        await journey.view.navigate(`${config.origin}/auth/callback?redirect=/explore`);
        await waitForPath(journey.view, "/explore");
        expect(journey.view.url).toMatch(/\/explore$/);
      } finally {
        await cleanup();
      }
    });
  });

  it("falls back home for an external callback destination", async () => {
    await withBrowserJourney("callback unsafe redirect", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey, { role: "listener" });
      try {
        await journey.view.navigate(
          `${config.origin}/auth/callback?redirect=${encodeURIComponent("https://evil.example")}`,
        );
        await waitForPath(journey.view, "/");
        const currentUrl = await journey.view.evaluate<string>("location.href");
        expect(currentUrl).toMatch(/\/$/);
        expect(currentUrl).not.toContain("evil.example");
      } finally {
        await cleanup();
      }
    });
  });
});
