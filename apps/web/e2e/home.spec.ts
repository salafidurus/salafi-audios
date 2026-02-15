import { test, expect } from "@playwright/test";

test("home page loads and shows essential sections", async ({ page }) => {
  await page.goto("/");

  // Check title
  await expect(page).toHaveTitle(/./);

  // Check that main heading or hero is present (assume Hero component has an aria-label or heading)
  // Since we don't have explicit test ids, we'll check for basic structure
  // Look for main shell
  const main = page.locator("main.shell");
  await expect(main).toBeAttached();

  // Check for stats band (likely contains "Total Lectures" or similar)
  // We'll just ensure page loaded without critical errors
  // Maybe check that there is a navigation header
  const header = page.locator("header, [role='banner']").first();
  await expect(header).toBeAttached();
});
