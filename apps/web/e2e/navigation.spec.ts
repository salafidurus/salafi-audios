import { test, expect } from "@playwright/test";

test.describe("Navigation — sidebar & routing", () => {
  test.describe("desktop viewport", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("sidebar is visible with primary aria label", async ({ page }) => {
      await page.goto("/");
      const sidebar = page.locator('[aria-label="Primary sidebar"]');
      await expect(sidebar).toBeVisible();
    });

    test("brand link navigates to home", async ({ page }) => {
      await page.goto("/feed");
      const brand = page.locator('[aria-label="Salafi Durus"]');
      await expect(brand).toBeVisible();
      await brand.click();
      await expect(page).toHaveURL("/");
    });

    test("clicking Feed sidebar link navigates to /feed", async ({ page }) => {
      await page.goto("/");
      const sidebar = page.locator('[aria-label="Primary sidebar"]');
      const feedLink = sidebar.getByText("Feeds", { exact: true });
      await feedLink.click();
      await expect(page).toHaveURL(/\/feed/);
    });

    test("clicking Live sidebar link navigates to /live", async ({ page }) => {
      await page.goto("/");
      const sidebar = page.locator('[aria-label="Primary sidebar"]');
      const liveLink = sidebar.getByText("Live", { exact: true });
      await liveLink.click();
      await expect(page).toHaveURL(/\/live/);
    });

    test("clicking Lessons sidebar link navigates to /library", async ({ page }) => {
      await page.goto("/");
      const sidebar = page.locator('[aria-label="Primary sidebar"]');
      const libraryLink = sidebar.getByText("Lessons", { exact: true });
      await libraryLink.click();
      await expect(page).toHaveURL(/\/library/);
    });

    test("page title updates on navigation", async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const homeTitle = await page.title();
      expect(homeTitle).toBeTruthy();

      await page.goto("/feed", { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/feed/);
      const feedTitle = await page.title();
      expect(feedTitle).toBeTruthy();
    });
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("sidebar is not visible on mobile", async ({ page }) => {
      await page.goto("/");
      const sidebar = page.locator('[aria-label="Primary sidebar"]');
      await expect(sidebar).not.toBeVisible();
    });

    test("page loads without errors on mobile", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto("/");
      await expect(page.locator("main").first()).toBeAttached();
      expect(errors).toHaveLength(0);
    });
  });
});
