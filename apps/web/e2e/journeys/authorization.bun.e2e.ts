import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { withAuthFixtures } from "../helpers/bun-webview-auth-fixtures";
import { createWebE2EServer, withBrowserJourney } from "../helpers/bun-webview-harness";
import { waitForText } from "../helpers/bun-webview-waits";

describe("authorization Bun.WebView journeys", () => {
  const webServer = createWebE2EServer({ defaultPort: 3020 });
  const { config } = webServer;
  beforeAll(webServer.start);
  afterAll(webServer.stop);

  it("does not expose admin navigation to a listener", async () => {
    await withBrowserJourney("listener authorization boundary", config.origin, async (journey) => {
      await withAuthFixtures(
        journey,
        {
          apiOrigin: config.apiOrigin,
          role: "listener",
        },
        async () => {
          await journey.view.navigate(`${config.origin}/settings`);
          await waitForText(journey.view, "Listener");
          const state = await journey.view.evaluate<{ account: string; adminLinks: number }>(
            `({
            account: document.body.textContent ?? '',
            adminLinks: [...document.querySelectorAll('a')].filter((link) => link.textContent?.includes('Admin Dashboard')).length,
          })`,
          );
          expect(state.account).toContain("Listener");
          expect(state.adminLinks).toBe(0);
        },
      );
    });
  });

  it("shows only scoped admin destinations for a scoped administrator", async () => {
    await withBrowserJourney(
      "scoped admin authorization boundary",
      config.origin,
      async (journey) => {
        await withAuthFixtures(
          journey,
          {
            apiOrigin: config.apiOrigin,
            role: "scoped-admin",
          },
          async () => {
            await journey.view.navigate(`${config.origin}/admin`);
            await waitForText(journey.view, "Contents");
            const links = await journey.view.evaluate<string[]>(
              `[...document.querySelectorAll('nav a')].map((link) => link.textContent?.trim() ?? '')`,
            );
            expect(links).toContain("Scholars");
            expect(links).toContain("Contents");
            expect(links).not.toContain("Users");
          },
        );
      },
    );
  });

  it("exposes user access management to a superadmin", async () => {
    await withBrowserJourney(
      "superadmin authorization boundary",
      config.origin,
      async (journey) => {
        await withAuthFixtures(
          journey,
          {
            apiOrigin: config.apiOrigin,
            role: "superadmin",
          },
          async () => {
            await journey.view.navigate(`${config.origin}/admin/users`);
            await waitForText(journey.view, "Manage Users");
            const page = await journey.view.evaluate<{ usersLink: number; heading: string }>(
              `({
            usersLink: [...document.querySelectorAll('nav a')].filter((link) => link.textContent?.includes('Users')).length,
            heading: document.querySelector('h1, h2')?.textContent ?? '',
          })`,
            );
            expect(page.usersLink).toBeGreaterThan(0);
            expect(page.heading.toLowerCase()).toContain("manage users");
          },
        );
      },
    );
  });
});
