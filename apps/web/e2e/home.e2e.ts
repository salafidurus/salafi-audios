import { test, expect } from "./test-base";

test("home page loads search landing", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/./);

  const heading = page.getByText("Find a lesson");
  await heading.waitFor({ state: "visible", timeout: 30_000 });
  await expect(heading).toBeVisible();

  const searchButton = page.getByRole("button", { name: "What do you want to listen to?" });
  await searchButton.waitFor({ state: "visible", timeout: 30_000 });
  await expect(searchButton).toBeVisible();
});
