import { test, expect } from "./test-base";

test.describe("Navigation — sidebar & routing", () => {
  test.describe("desktop viewport", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test("sidebar is visible", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByTestId("sidebar")).toBeVisible();
    });

    test("brand link navigates to home", async ({ page }) => {
      await page.goto("/explore");
      await expect(page.getByTestId("brand-link")).toBeVisible();
      await page.getByTestId("brand-link").click();
      await expect(page).toHaveURL("/");
    });

    test("clicking Scholars sidebar link navigates to /scholars", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByTestId("nav-link-scholars")).toBeVisible();
      await page.getByTestId("nav-link-scholars").click();
      await expect(page).toHaveURL(/\/scholars/);
    });

    test("clicking Library sidebar link navigates to /library", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByTestId("nav-link-library")).toBeVisible();
      await page.getByTestId("nav-link-library").click();
      await expect(page).toHaveURL(/\/library/);
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
