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

async function waitForText(view: Bun.WebView, expected: string): Promise<void> {
  await waitForBrowserCondition(
    view,
    `visible text: ${expected}`,
    `document.body.textContent?.includes(${JSON.stringify(expected)}) === true`,
    { timeoutMs: 20_000 },
  );
}

describe("authorization Bun.WebView journeys", () => {
  let config: E2EConfig;
  let server: WebServer | undefined;

  beforeAll(async () => {
    config = getE2EConfig({ ...process.env, BUN_E2E_PORT: process.env.BUN_E2E_PORT ?? "3020" });
    server = await startWebServer(config);
    await waitForWebReady(config.origin);
  });

  afterAll(async () => {
    await server?.stop();
  });

  it("does not expose admin navigation to a listener", async () => {
    await withBrowserJourney("listener authorization boundary", config.origin, async (journey) => {
      await journey.view.navigate("about:blank");
      const cleanup = await installAuthFixtures(journey, {
        apiOrigin: config.apiOrigin,
        role: "listener",
      });
      try {
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
      } finally {
        await cleanup();
      }
    });
  });

  it("shows only scoped admin destinations for a scoped administrator", async () => {
    await withBrowserJourney(
      "scoped admin authorization boundary",
      config.origin,
      async (journey) => {
        await journey.view.navigate("about:blank");
        const cleanup = await installAuthFixtures(journey, {
          apiOrigin: config.apiOrigin,
          role: "scoped-admin",
        });
        try {
          await journey.view.navigate(`${config.origin}/admin`);
          await waitForText(journey.view, "Contents");
          const links = await journey.view.evaluate<string[]>(
            `[...document.querySelectorAll('nav a')].map((link) => link.textContent?.trim() ?? '')`,
          );
          expect(links).toContain("Scholars");
          expect(links).toContain("Contents");
          expect(links).not.toContain("Users");
        } finally {
          await cleanup();
        }
      },
    );
  });

  it("exposes user access management to a superadmin", async () => {
    await withBrowserJourney(
      "superadmin authorization boundary",
      config.origin,
      async (journey) => {
        await journey.view.navigate("about:blank");
        const cleanup = await installAuthFixtures(journey, {
          apiOrigin: config.apiOrigin,
          role: "superadmin",
        });
        try {
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
        } finally {
          await cleanup();
        }
      },
    );
  });
});
