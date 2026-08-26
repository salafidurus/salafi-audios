import { test, expect } from "./test-base";

test("home page loads the study landing", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/./);

  // The featured hero is API-backed and may be absent when the catalog is empty.
  // The study header is the stable contract for the landing page.
  const heading = page.getByTestId("home-study-header");
  await heading.waitFor({ state: "visible", timeout: 30_000 });
  await expect(heading).not.toHaveText("");

  // The home page intentionally keeps search in the global navigation.
  await expect(page.getByRole("button", { name: "What do you want to listen to?" })).toHaveCount(0);

  await expect(page.getByRole("tablist", { name: "Browse by topic" })).toBeVisible();
});
