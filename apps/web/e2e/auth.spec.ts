import { test, expect } from "@playwright/test";

test.describe("Auth flows", () => {
  test.describe("sign-in page", () => {
    test("renders without errors", async ({ page }) => {
      await page.goto("/sign-in");

      await expect(page).toHaveTitle(/./);
      const heading = page.getByRole("heading", { name: "Sign In" });
      await expect(heading).toBeVisible();
    });

    test("social sign-in buttons are present", async ({ page }) => {
      await page.goto("/sign-in");

      const appleButton = page.getByRole("button", { name: "Continue with Apple" });
      const googleButton = page.getByRole("button", { name: "Continue with Google" });
      await expect(appleButton).toBeVisible();
      await expect(googleButton).toBeVisible();
    });
  });

  test.describe("protected routes", () => {
    test("accessing /account without session redirects to /sign-in", async ({ page }) => {
      await page.goto("/account");

      // Should redirect unauthenticated users to sign-in
      await expect(page).toHaveURL(/\/sign-in/);
    });

    test("accessing /account/legal without session renders page (public route)", async ({
      page,
    }) => {
      await page.goto("/account/legal");

      // Legal page is public — should not redirect
      await expect(page).toHaveTitle(/./);
      const main = page.locator("main").first();
      await expect(main).toBeAttached();
    });
  });
});
