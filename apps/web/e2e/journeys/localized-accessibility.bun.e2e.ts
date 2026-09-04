import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import {
  createWebE2EServer,
  initializeBrowserJourney,
  waitForBrowserCondition,
  withBrowserJourney,
} from "../helpers/bun-webview-harness";

describe("localized accessibility Bun.WebView journeys", () => {
  const webServer = createWebE2EServer();
  const { config } = webServer;
  beforeAll(webServer.start);
  afterAll(webServer.stop);

  it("renders the Arabic Settings profile journey with RTL semantics", async () => {
    await withBrowserJourney("Arabic Settings profile journey", config.origin, async ({ view }) => {
      await initializeBrowserJourney(view, config.origin, "ar");
      await view.navigate(`${config.origin}/settings?tab=profile`);
      await view.reload();
      await waitForBrowserCondition(
        view,
        "Arabic Settings heading is hydrated",
        `document.querySelector('h1')?.textContent?.trim() === "الإعدادات"`,
      );

      const page = await view.evaluate<{
        lang: string;
        direction: string;
        heading: string;
        selectedProfileTab: string | null;
      }>(`(() => ({
        lang: document.documentElement.lang,
        direction: document.documentElement.dir,
        heading: document.querySelector('h1')?.textContent?.trim() ?? "",
        selectedProfileTab: document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim() ?? null,
      }))()`);

      expect(page.lang).toBe("ar");
      expect(page.direction).toBe("rtl");
      expect(page.heading).toBe("الإعدادات");
      expect(page.selectedProfileTab).toBe("الملف الشخصي");
    });
  });

  it("keeps the catalog search control keyboard-focusable", async () => {
    await withBrowserJourney("keyboard catalog search journey", config.origin, async ({ view }) => {
      await initializeBrowserJourney(view, config.origin, "en");
      await view.navigate(`${config.origin}/`);
      await waitForBrowserCondition(
        view,
        "catalog search control is hydrated",
        `Boolean(document.querySelector('button[aria-label="Search catalog"]'))`,
      );
      await view.evaluate(`document.querySelector('button[aria-label="Search catalog"]')?.focus()`);
      expect(await view.evaluate(`document.activeElement?.getAttribute("aria-label")`)).toBe(
        "Search catalog",
      );
    });
  });

  it("keeps Settings and My Library tabs usable at the supported narrow viewport", async () => {
    await withBrowserJourney(
      "narrow My Library controls journey",
      config.origin,
      async ({ view }) => {
        await initializeBrowserJourney(view, config.origin, "en");
        await view.navigate(`${config.origin}/my-library`);
        await waitForBrowserCondition(
          view,
          "My Library tabs are hydrated",
          `document.querySelectorAll('[role="tab"]').length === 3`,
          { timeoutMs: config.readyTimeoutMs },
        );
        const library = await view.evaluate<{ tablist: boolean; completed: boolean }>(`({
          tablist: Boolean(document.querySelector('[role="tablist"][aria-label="My Library sections"]')),
          completed: Boolean(document.querySelector('a[href="/my-library?tab=completed"]')),
        })`);

        expect(library).toEqual({ tablist: true, completed: true });
      },
      { width: 375, height: 812 },
    );

    await withBrowserJourney(
      "narrow Settings controls journey",
      config.origin,
      async ({ view }) => {
        await initializeBrowserJourney(view, config.origin, "en");
        await view.navigate(`${config.origin}/settings`);
        await waitForBrowserCondition(
          view,
          "Settings tabs are hydrated",
          `Boolean(document.querySelector('[role="tablist"]'))`,
          { timeoutMs: config.readyTimeoutMs },
        );
        const settings = await view.evaluate<{ tablist: boolean; profile: boolean }>(`({
          tablist: Boolean(document.querySelector('[role="tablist"]')),
          profile: Boolean(document.querySelector('[role="tab"][data-state="inactive"]')),
        })`);

        expect(settings).toEqual({ tablist: true, profile: true });
      },
      { width: 375, height: 812 },
    );
  });

  it("exposes the localized five-root navigation in RTL", async () => {
    await withBrowserJourney(
      "Arabic five-root navigation journey",
      config.origin,
      async ({ view }) => {
        await initializeBrowserJourney(view, config.origin, "ar");
        await view.navigate(`${config.origin}/explore`);
        await waitForBrowserCondition(
          view,
          "Arabic bottom navigation is hydrated",
          `document.querySelectorAll('nav[aria-label="التنقل السفلي"] a').length === 5`,
          { timeoutMs: config.readyTimeoutMs },
        );

        const navigation = await view.evaluate<{
          direction: string;
          labels: string[];
          active: string;
        }>(`(() => {
          const root = document.querySelector('nav[aria-label="التنقل السفلي"]');
          return {
            direction: document.documentElement.dir,
            labels: [...(root?.querySelectorAll("a") ?? [])]
              .map((link) => link.textContent?.trim() ?? "")
              .filter(Boolean),
            active: root?.querySelector('a[aria-current="page"]')?.textContent?.trim() ?? "",
          };
        })()`);

        expect(navigation).toEqual({
          direction: "rtl",
          labels: ["الرئيسية", "استكشاف", "العلماء", "مكتبتي", "الإعدادات"],
          active: "استكشاف",
        });
      },
      { width: 390, height: 900 },
    );
  });

  it("preserves localized branded and shell-unavailable fallback recovery", async () => {
    await withBrowserJourney(
      "localized fallback recovery journey",
      config.origin,
      async ({ view }) => {
        await initializeBrowserJourney(view, config.origin, "ar");
        await view.navigate(`${config.origin}/`);
        await view.navigate(`${config.origin}/route-that-does-not-exist`);
        await waitForBrowserCondition(
          view,
          "Arabic not-found heading is rendered",
          `document.querySelector('h1')?.textContent?.trim() === "الصفحة غير موجودة"`,
        );
        await waitForBrowserCondition(
          view,
          "branded not-found shell is rendered",
          `Boolean(document.querySelector("header") && document.querySelector("footer"))`,
        );
        const notFound = await view.evaluate<{
          statusShell: boolean;
          homeLink: string;
          language: string;
          direction: string;
        }>(`({
        statusShell: Boolean(document.querySelector("header") && document.querySelector("footer")),
        homeLink: document.querySelector('main a')?.textContent?.trim() ?? "",
        language: document.documentElement.lang,
        direction: document.documentElement.dir,
      })`);
        expect(notFound).toEqual({
          statusShell: true,
          homeLink: "العودة إلى الصفحة الرئيسية",
          language: "ar",
          direction: "rtl",
        });

        await view.navigate(`${config.origin}/shell-failure`);
        await waitForBrowserCondition(
          view,
          "shell-unavailable recovery heading is rendered",
          `document.querySelector('h1')?.textContent?.trim() === "Page not found"`,
        );
        const emergency = await view.evaluate<{
          banner: boolean;
          footer: boolean;
          reload: string;
          homeHref: string;
        }>(`({
        banner: Boolean(document.querySelector("header")),
        footer: Boolean(document.querySelector("footer")),
        reload: document.querySelector('button')?.textContent?.trim() ?? "",
        homeHref: document.querySelector('main a')?.getAttribute('href') ?? "",
      })`);
        expect(emergency).toEqual({
          banner: false,
          footer: false,
          reload: "Reload page",
          homeHref: "/",
        });
      },
    );
  });

  it("applies stored theme preference before rendering fallback content", async () => {
    await withBrowserJourney("stored fallback theme journey", config.origin, async ({ view }) => {
      await initializeBrowserJourney(view, config.origin, "en");
      await view.navigate(`${config.origin}/`);
      await view.evaluate(`localStorage.setItem("theme-preference:v1", "dark")`);
      await view.navigate(`${config.origin}/route-that-does-not-exist`);
      await waitForBrowserCondition(
        view,
        "dark fallback theme is applied",
        `document.documentElement.dataset.theme === "dark"`,
      );
      expect(await view.evaluate(`document.documentElement.dataset.theme`)).toBe("dark");
    });
  });
});
