import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { withAuthFixtures } from "../helpers/bun-webview-auth-fixtures";
import { createWebE2EServer, withBrowserJourney } from "../helpers/bun-webview-harness";
import { waitForPath, waitForSelector } from "../helpers/bun-webview-waits";

describe("account Bun.WebView journeys", () => {
  const webServer = createWebE2EServer({ defaultPort: 3016 });
  const { config } = webServer;

  beforeAll(webServer.start);
  afterAll(webServer.stop);

  it("navigates from the account menu to the query-backed profile tab", async () => {
    await withBrowserJourney("account profile navigation", config.origin, async (journey) => {
      await withAuthFixtures(journey, {}, async () => {
        await journey.view.navigate(`${config.origin}/`);
        await waitForSelector(journey.view, '[aria-label="Account: Guest"]');
        await journey.view.click('[aria-label="Account: Guest"]');
        await waitForSelector(journey.view, 'a[role="menuitem"][href="/settings"]');
        await journey.view.navigate(`${config.origin}/settings`);
        expect(journey.view.url).toContain("/settings");
        await journey.view.navigate(`${config.origin}/settings?tab=profile`);
        expect(journey.view.url).toContain("/settings?tab=profile");
      });
    });
  });

  it("returns home after a successful confirmed sign-out", async () => {
    await withBrowserJourney("account successful sign-out", config.origin, async (journey) => {
      await withAuthFixtures(journey, { role: "listener" }, async () => {
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
      });
    });
  });

  it("keeps the profile confirmation open when sign-out fails", async () => {
    await withBrowserJourney("account failed sign-out", config.origin, async (journey) => {
      await withAuthFixtures(journey, { role: "listener", signOutStatus: 500 }, async () => {
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
      });
    });
  });
});
