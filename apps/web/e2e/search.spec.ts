import { test, expect } from "./test-base";

test.describe("Search", () => {
  test("search page loads at /search", async ({ page }) => {
    await page.goto("/search");

    await expect(page).toHaveTitle(/./);
  });

  test("search page accepts a query parameter", async ({ page }) => {
    await page.goto("/search?searchKey=tawhid");

    await expect(page).toHaveTitle(/./);
  });
});
