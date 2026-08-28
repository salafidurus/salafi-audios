import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { installAuthFixtures } from "./bun-webview-auth-fixtures";
import {
  getE2EConfig,
  startWebServer,
  waitForWebReady,
  withBrowserJourney,
  type E2EConfig,
  type WebServer,
} from "./bun-webview-harness";

async function waitForPath(view: Bun.WebView, path: string) {
  await view.evaluate(`new Promise((resolve, reject) => {
    const deadline = Date.now() + 20000;
    const check = () => {
      if (location.pathname + location.search === ${JSON.stringify(path)}) resolve(true);
      else if (Date.now() >= deadline) reject(new Error('Timed out waiting for path: ' + ${JSON.stringify(path)}));
      else setTimeout(check, 50);
    };
    check();
  })`);
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
        await journey.view.click('[aria-label="Account: Guest"]');
        await journey.view.click('a[role="menuitem"][href="/settings"]');
        await waitForPath(journey.view, "/settings");
        await journey.view.evaluate(
          `(() => [...document.querySelectorAll('[role="tab"]')]
            .find((tab) => tab.textContent?.trim() === 'Profile')?.click())()`,
        );
        await waitForPath(journey.view, "/settings?tab=profile");
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
        await journey.view.click('[data-testid="sign-out-trigger"]');
        await journey.view.click('[data-testid="confirm-modal-confirm"]');
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
        await journey.view.click('[data-testid="sign-out-trigger"]');
        await journey.view.click('[data-testid="confirm-modal-confirm"]');
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
