import { test, expect } from "./test-base";

test("home page loads the study landing", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/./);

  // Check the study header's semantic heading is present and not empty.
  const heading = page.getByTestId("home-study-header").getByRole("heading", { level: 1 });
  await heading.waitFor({ state: "visible", timeout: 30_000 });
  await expect(heading).not.toHaveText("");

  // The home page intentionally keeps search in the global navigation.
  await expect(page.getByRole("button", { name: "What do you want to listen to?" })).toHaveCount(0);

  await expect(page.getByRole("tablist", { name: "Browse by topic" })).toBeVisible();
});
