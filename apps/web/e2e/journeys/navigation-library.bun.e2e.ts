import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { withAuthFixtures } from "../helpers/bun-webview-auth-fixtures";
import {
  createWebE2EServer,
  waitForBrowserCondition,
  withBrowserJourney,
} from "../helpers/bun-webview-harness";
import { waitForText, waitForUrl } from "../helpers/bun-webview-waits";

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

describe("navigation and My Library Bun.WebView journeys", () => {
  const webServer = createWebE2EServer();
  const { config } = webServer;
  beforeAll(webServer.start);
  afterAll(webServer.stop);

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
          await waitForBrowserCondition(
            view,
            "scholars page content",
            `!document.body.innerText.includes("Something went wrong")`,
          );
          expect((await readPageState(view)).visibleText).toContain("Scholars");

          await view.navigate(`${config.origin}/my-library`);
          await waitForUrl(view, `${config.origin}/my-library`);

          await view.navigate(`${config.origin}/explore`);
          await waitForUrl(view, `${config.origin}/explore`);
          await waitForBrowserCondition(
            view,
            "explore page content",
            `!document.body.innerText.includes("Something went wrong")`,
          );
          expect((await readPageState(view)).visibleText).toContain("Explore");
        },
      );
    });

    it("preserves settings tab query state and the removed profile alias", async () => {
      await withBrowserJourney("settings query navigation", config.origin, async ({ view }) => {
        await view.navigate(`${config.origin}/settings?tab=profile`);
        await waitForBrowserCondition(
          view,
          "selected Profile settings tab",
          `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() === "Profile"`,
        );
        expect((await readPageState(view)).url).toBe(`${config.origin}/settings?tab=profile`);
        expect(
          await view.evaluate(
            `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() ?? ""`,
          ),
        ).toBe("Profile");

        await view.navigate(`${config.origin}/settings`);
        await waitForBrowserCondition(
          view,
          "selected General settings tab",
          `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() === "General"`,
        );
        expect(
          await view.evaluate(
            `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() ?? ""`,
          ),
        ).toBe("General");

        await view.navigate(`${config.origin}/settings?tab=unknown`);
        await waitForBrowserCondition(
          view,
          "selected General settings tab for unknown query",
          `document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() === "General"`,
        );
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
          await withAuthFixtures(journey, { apiOrigin: config.apiOrigin }, async () => {
            await journey.view.navigate(`${config.origin}/my-library?tab=unknown`);
            await waitForText(journey.view, "Continue listening");
            expect((await readPageState(journey.view)).visibleText).toContain("Continue listening");
            expect((await readPageState(journey.view)).visibleText).not.toContain("Page not found");

            await journey.view.navigate(`${config.origin}/my-library?tab=saved`);
            await waitForText(journey.view, "Sign in to view saved lectures");
            expect((await readPageState(journey.view)).url).toBe(
              `${config.origin}/my-library?tab=saved`,
            );
          });
        },
      );
    });
  });
});
