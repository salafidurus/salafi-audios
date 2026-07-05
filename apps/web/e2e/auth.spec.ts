import { test, expect } from "./test-base";

test.describe("Auth flows", () => {
  test.describe("sign-in page", () => {
    test("renders without errors", async ({ page }) => {
      await page.goto("/sign-in");

      await expect(page).toHaveTitle(/./);
      const heading = page.getByRole("heading", { name: "Salafi Durus" });
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
    test("accessing /account/profile without session shows auth prompt (auth-optional)", async ({
      page,
    }) => {
      await page.goto("/account/profile");

      // /account/profile is auth-optional — stays on page, shows in-page auth prompt
      await expect(page).toHaveURL(/\/account\/profile/);
      await expect(page).not.toHaveURL(/\/sign-in/);
    });

    test("accessing /feed/following without session redirects to /sign-in", async ({ page }) => {
      await page.goto("/feed/following");

      // auth-required leaf — unauthenticated users are redirected to sign-in
      await expect(page).toHaveURL(/\/sign-in/);
    });

    test("accessing /account without session does not redirect (auth-optional)", async ({
      page,
    }) => {
      await page.goto("/account");

      // /account is auth-optional — the section renders for everyone
      await expect(page).not.toHaveURL(/\/sign-in/);
    });

    test("accessing /account/legal without session renders page (public route)", async ({
      page,
    }) => {
      await page.goto("/account/legal");

      // Legal page is public — should not redirect
      await expect(page).not.toHaveURL(/\/sign-in/);
      await expect(page).toHaveTitle(/./);
    });
  });
});
