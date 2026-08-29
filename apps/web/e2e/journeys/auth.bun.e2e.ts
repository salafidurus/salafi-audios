import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { withAuthFixtures } from "../helpers/bun-webview-auth-fixtures";
import { createWebE2EServer, withBrowserJourney } from "../helpers/bun-webview-harness";
import { waitForSelector } from "../helpers/bun-webview-waits";

describe("authentication Bun.WebView journeys", () => {
  const webServer = createWebE2EServer({ defaultPort: 3028 });
  const { config } = webServer;
  beforeAll(webServer.start);
  afterAll(webServer.stop);

  it("renders the sign-in controls through the production web app", async () => {
    await withBrowserJourney("authentication sign-in controls", config.origin, async (journey) => {
      await withAuthFixtures(journey, {}, async () => {
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
      });
    });
  });

  it("keeps anonymous account and legal routes out of sign-in", async () => {
    await withBrowserJourney("anonymous account routes", config.origin, async (journey) => {
      await withAuthFixtures(journey, {}, async () => {
        for (const path of ["/account/profile", "/account", "/account/legal"]) {
          await journey.view.navigate(`${config.origin}${path}`);
          expect(journey.view.url, path).not.toContain("/sign-in");
        }
      });
    });
  });

  it("redirects anonymous admin access to sign-in", async () => {
    await withBrowserJourney("anonymous admin boundary", config.origin, async (journey) => {
      await withAuthFixtures(journey, {}, async () => {
        await journey.view.navigate(`${config.origin}/admin`);
        expect(journey.view.url).toContain("/sign-in");
      });
    });
  });
});
