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

async function waitForSelector(view: Bun.WebView, selector: string): Promise<void> {
  await waitForBrowserCondition(
    view,
    `selector: ${selector}`,
    `document.querySelector(${JSON.stringify(selector)}) !== null`,
    { timeoutMs: 20_000 },
  );
}

describe("authentication Bun.WebView journeys", () => {
  let config: E2EConfig;
  let server: WebServer | undefined;

  beforeAll(async () => {
    config = getE2EConfig({ ...process.env, BUN_E2E_PORT: process.env.BUN_E2E_PORT ?? "3028" });
    server = await startWebServer(config);
    await waitForWebReady(config.origin);
  });

  afterAll(async () => {
    await server?.stop();
  });

  it("renders the sign-in controls through the production web app", async () => {
    await withBrowserJourney("authentication sign-in controls", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey);
      try {
        await journey.view.navigate(`${config.origin}/sign-in`);
        await waitForSelector(journey.view, "h1");
        const page = await journey.view.evaluate<{
          title: string;
          heading: string;
          apple: number;
          google: number;
        }>(
          `(() => ({
            title: document.title,
            heading: document.querySelector('h1')?.textContent ?? '',
            apple: document.querySelectorAll('[aria-label="Continue with Apple"]').length,
            google: document.querySelectorAll('[aria-label="Continue with Google"]').length,
          }))()`,
        );

        expect(page.title).not.toBe("");
        expect(page.heading).toContain("Salafi Durus");
        expect(page.apple).toBe(1);
        expect(page.google).toBe(1);
      } finally {
        await cleanup();
      }
    });
  });

  it("keeps anonymous account and legal routes out of sign-in", async () => {
    await withBrowserJourney("anonymous account routes", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey);
      try {
        for (const path of ["/account/profile", "/account", "/account/legal"]) {
          await journey.view.navigate(`${config.origin}${path}`);
          expect(journey.view.url, path).not.toContain("/sign-in");
        }
      } finally {
        await cleanup();
      }
    });
  });

  it("redirects anonymous admin access to sign-in", async () => {
    await withBrowserJourney("anonymous admin boundary", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey);
      try {
        await journey.view.navigate(`${config.origin}/admin`);
        expect(journey.view.url).toContain("/sign-in");
      } finally {
        await cleanup();
      }
    });
  });
});
