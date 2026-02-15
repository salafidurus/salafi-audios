import { test, expect } from "@playwright/test";

test("scholars page loads with heading and content", async ({ page }) => {
  await page.goto("/scholars");

  // Check page title or heading
  await expect(page).toHaveTitle(/scholars/i);

  // Look for heading "Scholars"
  const heading = page.getByRole("heading", { name: /scholars/i });
  await expect(heading).toBeVisible();

  // The page should have a main content area (Shell)
  const shell = page.locator("main.shell, [role='main']").first();
  await expect(shell).toBeAttached();
});
