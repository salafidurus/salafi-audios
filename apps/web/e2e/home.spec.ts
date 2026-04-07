import { test, expect } from "@playwright/test";

test("home page loads search landing", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/./);

  const main = page.locator("main").first();
  await expect(main).toBeAttached();

  const heading = main.locator("p").filter({ hasText: "Find a lesson" });
  await expect(heading).toBeVisible();

  const searchButton = page.getByRole("button", { name: "What do you want to listen to?" });
  await expect(searchButton).toBeVisible();
});
