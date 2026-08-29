import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { installAuthFixtures } from "../support/bun-webview-auth-fixtures";
import {
  getE2EConfig,
  startWebServer,
  waitForWebReady,
  withBrowserJourney,
  type E2EConfig,
  type WebServer,
} from "../support/bun-webview-harness";

type PageState = {
  url: string;
  title: string;
  mainNavigation: string[];
  sidebarCount: number;
  visibleText: string;
};

async function readPageState(view: Bun.WebView): Promise<PageState> {
  return view.evaluate<PageState>(`(() => ({
    url: window.location.href,
    title: document.title,
    mainNavigation: [...document.querySelectorAll('nav[aria-label="Main"] a')]
      .map((link) => link.textContent?.trim() ?? "")
      .filter(Boolean),
    sidebarCount: document.querySelectorAll('[data-testid="sidebar"]').length,
    visibleText: document.body.innerText,
  }))()`);
}

async function waitForUrl(view: Bun.WebView, expected: string): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if ((await readPageState(view)).url === expected) return;
    await Bun.sleep(50);
  }
  throw new Error(`Expected ${expected}, received ${(await readPageState(view)).url}`);
}

async function waitForText(view: Bun.WebView, expected: string): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const state = await readPageState(view);
    if (state.visibleText.includes(expected)) return;
    await Bun.sleep(50);
  }
  throw new Error(`Expected visible text: ${expected}`);
}

describe("navigation and My Library Bun.WebView journeys", () => {
  let config: E2EConfig;
  let server: WebServer | undefined;

  beforeAll(async () => {
    config = getE2EConfig();
    server = await startWebServer(config);
    await waitForWebReady(config.origin, { timeoutMs: config.readyTimeoutMs });
  });

  afterAll(async () => {
    await server?.stop();
  });

  describe("public navigation", () => {
    it("shows public destinations and the catalog search affordance", async () => {
      await withBrowserJourney(
        "public navigation destinations and search",
        config.origin,
        async ({ view }) => {
          await view.navigate(`${config.origin}/`);
          const state = await readPageState(view);

          expect(state.mainNavigation).toEqual(["Home", "Explore", "Scholars", "My Library"]);
          expect(state.sidebarCount).toBe(0);
          expect(state.title).not.toBe("");

          expect(
            await view.evaluate(
              `document.querySelector('button[aria-label="Search catalog"]')?.textContent?.trim() ?? ""`,
            ),
          ).toContain("Search catalog");
        },
      );
    });

    it("resolves the public brand, scholars, My Library, and Explore destinations", async () => {
      await withBrowserJourney(
        "public navigation destinations",
        config.origin,
        async ({ view }) => {
          await view.navigate(`${config.origin}/`);
          await view.navigate(`${config.origin}/scholars`);
          await waitForUrl(view, `${config.origin}/scholars`);

          await view.navigate(`${config.origin}/my-library`);
          await waitForUrl(view, `${config.origin}/my-library`);

          await view.navigate(`${config.origin}/explore`);
          await waitForUrl(view, `${config.origin}/explore`);
        },
      );
    });

    it("preserves settings tab query state and the removed profile alias", async () => {
      await withBrowserJourney("settings query navigation", config.origin, async ({ view }) => {
        await view.navigate(`${config.origin}/settings?tab=profile`);
        await waitForText(view, "Profile");
        expect((await readPageState(view)).url).toBe(`${config.origin}/settings?tab=profile`);
        expect(
          await view.evaluate(
            `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() ?? ""`,
          ),
        ).toBe("Profile");

        await view.navigate(`${config.origin}/settings`);
        await waitForText(view, "General");
        expect(
          await view.evaluate(
            `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() ?? ""`,
          ),
        ).toBe("General");

        await view.navigate(`${config.origin}/settings?tab=unknown`);
        await waitForText(view, "General");
        expect(
          await view.evaluate(
            `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() ?? ""`,
          ),
        ).toBe("General");

        await view.navigate(`${config.origin}/settings/profile`);
        expect(view.url).toBe(`${config.origin}/settings/profile`);
        expect((await readPageState(view)).visibleText).toContain("Page not found");
      });
    });

    it("loads the public page on a narrow viewport without client errors", async () => {
      await withBrowserJourney(
        "public navigation narrow viewport",
        config.origin,
        async ({ view, console }) => {
          await view.navigate(`${config.origin}/`);
          expect(console.filter((entry) => entry.type === "error")).toHaveLength(0);
        },
        { width: 375, height: 812 },
      );
    });
  });

  describe("My Library", () => {
    it("loads canonical Started, Saved, and Completed tab states", async () => {
      await withBrowserJourney("My Library canonical tabs", config.origin, async ({ view }) => {
        await view.navigate(`${config.origin}/my-library`);
        await waitForText(view, "Continue listening");
        expect((await readPageState(view)).visibleText).toContain("Continue listening");

        for (const tab of ["saved", "completed"] as const) {
          const label = tab === "saved" ? "Saved" : "Completed";
          await view.navigate(`${config.origin}/my-library?tab=${tab}`);
          await waitForText(view, label);
          expect((await readPageState(view)).url).toBe(`${config.origin}/my-library?tab=${tab}`);
          expect(
            await view.evaluate(
              `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() ?? ""`,
            ),
          ).toBe(label);
          expect((await readPageState(view)).visibleText).toContain(label);
        }
      });
    });

    it("updates URL state and restores both browser history directions", async () => {
      await withBrowserJourney("My Library tab history", config.origin, async ({ view }) => {
        await view.navigate(`${config.origin}/my-library`);
        await view.navigate(`${config.origin}/my-library?tab=saved`);
        await waitForUrl(view, `${config.origin}/my-library?tab=saved`);
        await waitForText(view, "Saved");

        await view.evaluate(`history.back()`);
        await waitForUrl(view, `${config.origin}/my-library`);
        await waitForText(view, "Continue listening");

        await view.evaluate(`history.forward()`);
        await waitForUrl(view, `${config.origin}/my-library?tab=saved`);
        await waitForText(view, "Saved");
      });
    });

    it("falls back to Started and preserves anonymous library state", async () => {
      await withBrowserJourney(
        "My Library anonymous and invalid tabs",
        config.origin,
        async (journey) => {
          await journey.view.navigate("about:blank");
          const cleanup = await installAuthFixtures(journey, { apiOrigin: config.apiOrigin });
          try {
            await journey.view.navigate(`${config.origin}/my-library?tab=unknown`);
            await waitForText(journey.view, "Continue listening");
            expect((await readPageState(journey.view)).visibleText).toContain("Continue listening");
            expect((await readPageState(journey.view)).visibleText).not.toContain("Page not found");

            await journey.view.navigate(`${config.origin}/my-library?tab=saved`);
            await waitForText(journey.view, "Sign in to view saved lectures");
            expect((await readPageState(journey.view)).url).toBe(
              `${config.origin}/my-library?tab=saved`,
            );
          } finally {
            await cleanup();
          }
        },
      );
    });
  });
});
