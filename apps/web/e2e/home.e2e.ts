import { test, expect } from "./test-base";

test("home page loads search landing", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/./);

  // Check the hero title using its data-testid
  const heading = page.getByTestId("home-hero-title");
  await heading.waitFor({ state: "visible", timeout: 30_000 });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText("Salafi Durus");

  // Check the search button
  const searchButton = page.getByRole("button", { name: "What do you want to listen to?" });
  await searchButton.waitFor({ state: "visible", timeout: 30_000 });
  await expect(searchButton).toBeVisible();
});
