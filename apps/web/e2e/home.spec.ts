import { test, expect } from "./test-base";

test("home page loads search landing", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/./);

  const heading = page.getByText("Find a lesson");
  await expect(heading).toBeVisible();

  const searchButton = page.getByRole("button", { name: "What do you want to listen to?" });
  await expect(searchButton).toBeVisible();
});
