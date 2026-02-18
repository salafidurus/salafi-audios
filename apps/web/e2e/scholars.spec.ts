import { test, expect } from "@playwright/test";

test("scholars page loads with heading and content", async ({ page }) => {
  await page.goto("/scholars");

  await expect(page).toHaveTitle(/scholars/i);

  const heading = page.getByRole("heading", { name: /scholars/i }).first();
  await expect(heading).toBeVisible();

  const main = page.locator("main").first();
  await expect(main).toBeAttached();
});
