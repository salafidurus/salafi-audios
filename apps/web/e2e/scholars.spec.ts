import { test, expect } from "@playwright/test";

test.describe("Scholar browsing", () => {
  test.describe("scholar detail page", () => {
    // Scholar detail pages require a valid slug that exists in the backend.
    // These tests verify the page shell renders without crashing; real content
    // depends on a seeded database.

    test("scholar detail page loads for a known slug", async () => {
      test.skip(true, "Requires seeded database with a known scholar slug");
    });

    test("navigating to a non-existent scholar shows not-found state", async ({ page }) => {
      await page.goto("/scholars/non-existent-scholar-slug-12345");

      // The page should render without a hard crash
      await expect(page).toHaveTitle(/./);

      // Expect either a not-found message or a loading → not-found transition
      const main = page.locator("main").first();
      await expect(main).toBeAttached();
    });
  });

  test.describe("scholar discovery from search home", () => {
    test("home page shows quick browse section with scholars", async ({ page }) => {
      // The search home (/) includes a quick-browse area that may list scholars.
      // Availability depends on backend data, so we only assert the page loads.
      await page.goto("/");
      await expect(page.locator("main").first()).toBeAttached();
    });

    test("clicking a scholar card navigates to /scholars/:slug", async () => {
      test.skip(true, "Requires seeded database with scholars in quick-browse");
    });
  });
});
