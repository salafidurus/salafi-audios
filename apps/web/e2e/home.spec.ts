import { test, expect } from "@playwright/test";

test("home page loads and shows essential sections", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/./);

  const main = page.locator("main").first();
  await expect(main).toBeAttached();

  const header = page.locator("header, [role='banner']").first();
  await expect(header).toBeAttached();
});
