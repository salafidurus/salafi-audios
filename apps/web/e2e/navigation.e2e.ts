import { test, expect } from "./test-base";

test.describe("Navigation — public workspace & routing", () => {
  test.describe("desktop viewport", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("public navigation is visible without the global sidebar", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
      await expect(page.getByTestId("sidebar")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Search catalog" })).toBeVisible();
    });

    test("search trigger opens the catalog command palette", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Search catalog" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
    });

    test("brand link navigates to home", async ({ page }) => {
      await page.goto("/explore");
      const brandLink = page.getByRole("link", { name: "Salafi Durus" }).first();
      await expect(brandLink).toBeVisible();
      await brandLink.click();
      await expect(page).toHaveURL("/");
    });

    test("clicking Scholars public navigation link navigates to /scholars", async ({ page }) => {
      await page.goto("/");
      const scholarsLink = page.getByRole("navigation", { name: "Main" }).getByRole("link", {
        name: "Scholars",
      });
      await expect(scholarsLink).toBeVisible();
      await scholarsLink.click();
      await expect(page).toHaveURL(/\/scholars/);
    });

    test("clicking My Library public navigation link navigates to /my-library", async ({
      page,
    }) => {
      await page.goto("/");
      const libraryLink = page.getByRole("navigation", { name: "Main" }).getByRole("link", {
        name: "Library",
      });
      await expect(libraryLink).toBeVisible();
      await libraryLink.click();
      await expect(page).toHaveURL(/\/my-library/);
    });

    test("page title updates on navigation", async ({ page }) => {
      await page.goto("/");
      expect(await page.title()).toBeTruthy();
      await page.goto("/explore");
      await expect(page).toHaveURL(/\/explore/);
      expect(await page.title()).toBeTruthy();
    });

    test("settings exposes accessible general and profile tabs", async ({ page }) => {
      await page.goto("/settings");

      const tabs = page.getByRole("tablist", { name: "Settings sections" });
      await expect(tabs).toBeVisible();
      await expect(tabs.getByRole("tab", { name: "General" })).toBeVisible();
      await expect(tabs.getByRole("tab", { name: "Profile" })).toBeVisible();
    });
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("page loads without errors on mobile", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      await page.goto("/");
      expect(errors).toHaveLength(0);
    });
  });
});
