import { test, expect } from "./test-base";

test.describe("Search", () => {
  test("search home loads with prompt text", async ({ page }) => {
    await page.goto("/");

    const main = page.locator("main").first();
    await expect(main).toBeAttached();

    const heading = main.getByText("Find a lesson");
    await expect(heading).toBeVisible();
  });

  test("search button is visible on home page", async ({ page }) => {
    await page.goto("/");

    const searchButton = page.getByRole("button", {
      name: "What do you want to listen to?",
    });
    await expect(searchButton).toBeVisible();
  });

  test("search page loads at /search", async ({ page }) => {
    await page.goto("/search");

    await expect(page).toHaveTitle(/./);
    const main = page.locator("main").first();
    await expect(main).toBeAttached();
  });

  test("search page accepts a query parameter", async ({ page }) => {
    await page.goto("/search?searchKey=tawhid");

    await expect(page).toHaveTitle(/./);
    // The page should render without crashing even with a query
    const main = page.locator("main").first();
    await expect(main).toBeAttached();
  });

  test("typing in search input shows results", async () => {
    test.skip(true, "Requires running backend with indexed content");
  });

  test("clicking a search result navigates to detail page", async () => {
    test.skip(true, "Requires running backend with indexed content");
  });

  test("empty search page shows appropriate state", async ({ page }) => {
    // Navigate directly to search without a query
    await page.goto("/search");

    const main = page.locator("main").first();
    await expect(main).toBeAttached();
    // Page should not crash; may show empty state or search prompt
  });
});
