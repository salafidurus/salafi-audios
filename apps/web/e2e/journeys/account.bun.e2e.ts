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

async function waitForPath(view: Bun.WebView, path: string): Promise<void> {
  await waitForBrowserCondition(
    view,
    `path: ${path}`,
    `location.pathname + location.search === ${JSON.stringify(path)}`,
    { timeoutMs: 20_000 },
  );
}

describe("account Bun.WebView journeys", () => {
  let config: E2EConfig;
  let server: WebServer | undefined;

  beforeAll(async () => {
    config = getE2EConfig({ ...process.env, BUN_E2E_PORT: process.env.BUN_E2E_PORT ?? "3016" });
    server = await startWebServer(config);
    await waitForWebReady(config.origin);
  });

  afterAll(async () => {
    await server?.stop();
  });

  it("navigates from the account menu to the query-backed profile tab", async () => {
    await withBrowserJourney("account profile navigation", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey);
      try {
        await journey.view.navigate(`${config.origin}/`);
        await waitForSelector(journey.view, '[aria-label="Account: Guest"]');
        await journey.view.click('[aria-label="Account: Guest"]');
        await waitForSelector(journey.view, 'a[role="menuitem"][href="/settings"]');
        await journey.view.navigate(`${config.origin}/settings`);
        expect(journey.view.url).toContain("/settings");
        await journey.view.navigate(`${config.origin}/settings?tab=profile`);
        expect(journey.view.url).toContain("/settings?tab=profile");
      } finally {
        await cleanup();
      }
    });
  });

  it("returns home after a successful confirmed sign-out", async () => {
    await withBrowserJourney("account successful sign-out", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey, { role: "listener" });
      try {
        await journey.view.navigate(`${config.origin}/settings?tab=profile`);
        await waitForSelector(journey.view, '[data-testid="sign-out-trigger"]');
        await journey.view.evaluate(
          `document.querySelector('[data-testid="sign-out-trigger"]')?.click()`,
        );
        await waitForSelector(journey.view, '[data-testid="confirm-modal-confirm"]');
        await journey.view.evaluate(
          `document.querySelector('[data-testid="confirm-modal-confirm"]')?.click()`,
        );
        await waitForPath(journey.view, "/");
        expect(journey.view.url).not.toContain("/sign-in");
      } finally {
        await cleanup();
      }
    });
  });

  it("keeps the profile confirmation open when sign-out fails", async () => {
    await withBrowserJourney("account failed sign-out", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey, { role: "listener", signOutStatus: 500 });
      try {
        await journey.view.navigate(`${config.origin}/settings?tab=profile`);
        await waitForSelector(journey.view, '[data-testid="sign-out-trigger"]');
        await journey.view.evaluate(
          `document.querySelector('[data-testid="sign-out-trigger"]')?.click()`,
        );
        await waitForSelector(journey.view, '[data-testid="confirm-modal-confirm"]');
        await journey.view.evaluate(
          `document.querySelector('[data-testid="confirm-modal-confirm"]')?.click()`,
        );
        await waitForSelector(journey.view, '[role="alert"]');
        const state = await journey.view.evaluate<{ modal: number; error: string }>(
          `({
            modal: document.querySelectorAll('[data-testid="confirm-modal"]').length,
            error: document.querySelector('[role="alert"]')?.textContent ?? '',
          })`,
        );
        expect(state.modal).toBe(1);
        expect(state.error).toContain("Sign out failed");
        expect(journey.view.url).toContain("/settings?tab=profile");
      } finally {
        await cleanup();
      }
    });
  });
});
