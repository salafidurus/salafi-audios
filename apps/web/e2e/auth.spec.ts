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

    test("has link to sign-up page", async ({ page }) => {
      await page.goto("/sign-in");

      const signUpLink = page.getByText("Create one");
      await expect(signUpLink).toBeVisible();
    });

    test("navigating to sign-up works from sign-in", async ({ page }) => {
      await page.goto("/sign-in");

      const signUpLink = page.getByText("Create one");
      await signUpLink.click();
      await expect(page).toHaveURL(/\/sign-up/);
    });
  });

  test.describe("sign-up page", () => {
    test("renders without errors", async ({ page }) => {
      await page.goto("/sign-up");

      await expect(page).toHaveTitle(/./);
      const heading = page.getByRole("heading", { name: "Create Account" });
      await expect(heading).toBeVisible();
    });

    test("social sign-up buttons are present", async ({ page }) => {
      await page.goto("/sign-up");

      const appleButton = page.getByRole("button", { name: "Continue with Apple" });
      const googleButton = page.getByRole("button", { name: "Continue with Google" });
      await expect(appleButton).toBeVisible();
      await expect(googleButton).toBeVisible();
    });

    test("terms checkbox is present and unchecked by default", async ({ page }) => {
      await page.goto("/sign-up");

      const termsCheckbox = page.getByRole("checkbox");
      await expect(termsCheckbox).toBeVisible();
      await expect(termsCheckbox).not.toBeChecked();
    });

    test("social buttons are disabled until terms are accepted", async ({ page }) => {
      await page.goto("/sign-up");

      const appleButton = page.getByRole("button", { name: "Continue with Apple" });
      const googleButton = page.getByRole("button", { name: "Continue with Google" });

      // Initially disabled
      await expect(appleButton).toBeDisabled();
      await expect(googleButton).toBeDisabled();

      // Check the terms checkbox
      const termsCheckbox = page.getByRole("checkbox");
      await termsCheckbox.check();

      // Now enabled
      await expect(appleButton).toBeEnabled();
      await expect(googleButton).toBeEnabled();
    });

    test("has link to sign-in page", async ({ page }) => {
      await page.goto("/sign-up");

      const signInLink = page.getByRole("button", { name: "Sign in", exact: true });
      await expect(signInLink).toBeVisible();
    });

    test("navigating to sign-in works from sign-up", async ({ page }) => {
      await page.goto("/sign-up");

      const signInLink = page.getByRole("button", { name: "Sign in", exact: true });
      await signInLink.click();
      await expect(page).toHaveURL(/\/sign-in/);
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
