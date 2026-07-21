import { test as base, expect } from "@playwright/test";

/**
 * Shared E2E base test.
 *
 * Defaults every navigation to `domcontentloaded` instead of Playwright's
 * built-in `load`. Data-driven routes (notably `/feed`) keep network
 * connections open via React Query / streaming, so waiting for the full `load`
 * event intermittently exceeds the navigation timeout — the recurring
 * "navigating to /feed timed out" flake. `domcontentloaded` resolves once the
 * document is parsed, which is sufficient for the routing/title/visibility
 * assertions these suites make, while still allowing per-call overrides.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Pre-accept cookies to avoid modal blocking interactions
    page.addInitScript(() => {
      localStorage.setItem("cookie-consent:v1", "true");
    });

    const originalGoto = page.goto.bind(page);
    page.goto = ((
      url: Parameters<typeof page.goto>[0],
      options?: Parameters<typeof page.goto>[1],
    ) =>
      originalGoto(url, {
        waitUntil: "domcontentloaded",
        ...options,
      })) as typeof page.goto;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect };
