import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { withAuthFixtures } from "../helpers/bun-webview-auth-fixtures";
import { createWebE2EServer, withBrowserJourney } from "../helpers/bun-webview-harness";
import { waitForHeading, waitForPath, waitForText } from "../helpers/bun-webview-waits";

describe("authentication callback Bun.WebView journeys", () => {
  const webServer = createWebE2EServer({ defaultPort: 3012 });
  const { config } = webServer;
  beforeAll(webServer.start);
  afterAll(webServer.stop);

  it("renders callback loading state inside the public shell", async () => {
    await withBrowserJourney("callback loading state", config.origin, async (journey) => {
      await withAuthFixtures(journey, { sessionDelayMs: 500 }, async () => {
        await journey.view.navigate(`${config.origin}/auth/callback?redirect=/explore`);
        await waitForText(journey.view, "Completing sign-in...");
        const state = await journey.view.evaluate<{ main: number; text: string }>(
          `({ main: document.querySelectorAll('main').length, text: document.body.textContent ?? '' })`,
        );
        expect(state.main).toBe(1);
        expect(state.text).toContain("Completing sign-in...");
      });
    });
  });

  it("shows timeout recovery when session verification does not finish", async () => {
    await withBrowserJourney("callback timeout recovery", config.origin, async (journey) => {
      await withAuthFixtures(journey, { sessionDelayMs: 11000 }, async () => {
        await journey.view.navigate(`${config.origin}/auth/callback`);
        await waitForHeading(journey.view, "Authentication Timeout");
        expect(journey.view.url).toContain("/auth/callback");
      });
    });
  });

  it("shows sign-in recovery when session verification fails", async () => {
    await withBrowserJourney("callback error recovery", config.origin, async (journey) => {
      await withAuthFixtures(journey, { sessionStatus: 500 }, async () => {
        await journey.view.navigate(`${config.origin}/auth/callback`);
        await waitForHeading(journey.view, "Authentication Error");
        expect(await journey.view.evaluate("document.body.textContent ?? ''")).toContain(
          "Try again",
        );
      });
    });
  });

  it("redirects a verified session to a safe relative destination", async () => {
    await withBrowserJourney("callback successful redirect", config.origin, async (journey) => {
      await withAuthFixtures(journey, { role: "listener" }, async () => {
        await journey.view.navigate(`${config.origin}/auth/callback?redirect=/explore`);
        await waitForPath(journey.view, "/explore");
        expect(journey.view.url).toMatch(/\/explore$/);
      });
    });
  });

  it("falls back home for an external callback destination", async () => {
    await withBrowserJourney("callback unsafe redirect", config.origin, async (journey) => {
      await withAuthFixtures(journey, { role: "listener" }, async () => {
        await journey.view.navigate(
          `${config.origin}/auth/callback?redirect=${encodeURIComponent("https://evil.example")}`,
        );
        await waitForPath(journey.view, "/");
        const currentUrl = await journey.view.evaluate<string>("location.href");
        expect(currentUrl).toMatch(/\/$/);
        expect(currentUrl).not.toContain("evil.example");
      });
    });
  });
});
