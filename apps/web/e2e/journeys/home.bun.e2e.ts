import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { createWebE2EServer, withBrowserJourney } from "../helpers/bun-webview-harness";

describe("public home Bun.WebView journey", () => {
  const webServer = createWebE2EServer();
  const { config } = webServer;
  beforeAll(webServer.start);
  afterAll(webServer.stop);

  it("loads the study landing through the production web app", async () => {
    await withBrowserJourney("public home loads study landing", config.origin, async ({ view }) => {
      await view.navigate(`${config.origin}/`);
      const page = await view.evaluate<{
        title: string;
        studyHeader: string;
        topicTabs: number;
        legacySearch: number;
      }>(`(() => ({
        title: document.title,
        studyHeader: document.querySelector('[data-testid="home-study-header"]')?.textContent ?? "",
        topicTabs: document.querySelectorAll('[role="tablist"][aria-label="Browse by topic"]').length,
        legacySearch: document.querySelectorAll('[aria-label="What do you want to listen to?"]').length,
      }))()`);

      expect(page.title).not.toBe("");
      expect(page.studyHeader).not.toBe("");
      expect(page.topicTabs).toBe(1);
      expect(page.legacySearch).toBe(0);
    });
  });
});
