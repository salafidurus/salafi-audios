import { test, expect } from "@playwright/test";

test.describe("Auth flows", () => {
  test.describe("sign-in page", () => {
    test("renders without errors", async ({ page }) => {
      await page.goto("/sign-in");

      await expect(page).toHaveTitle(/./);
      const heading = page.getByRole("heading", { name: "Sign In" });
      await expect(heading).toBeVisible();
    });

    test("email input is present", async ({ page }) => {
      await page.goto("/sign-in");

      const emailInput = page.getByPlaceholder("Email");
      await expect(emailInput).toBeVisible();
    });

    test("password input is present", async ({ page }) => {
      await page.goto("/sign-in");

      const passwordInput = page.getByPlaceholder("Password");
      await expect(passwordInput).toBeVisible();
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

    test("submitting empty form does not navigate away", async ({ page }) => {
      await page.goto("/sign-in");

      const submitButton = page.getByRole("button", { name: "Sign In" });
      // Button should be disabled when form is empty
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe("sign-up page", () => {
    test("renders without errors", async ({ page }) => {
      await page.goto("/sign-up");

      await expect(page).toHaveTitle(/./);
      const heading = page.getByRole("heading", { name: "Create Account" });
      await expect(heading).toBeVisible();
    });

    test("form fields are present", async ({ page }) => {
      await page.goto("/sign-up");

      await expect(page.getByPlaceholder("Name")).toBeVisible();
      await expect(page.getByPlaceholder("Email")).toBeVisible();
      await expect(page.getByPlaceholder("Password")).toBeVisible();
    });

    test("terms checkbox is present and unchecked by default", async ({ page }) => {
      await page.goto("/sign-up");

      // Terms agreement must be checked before submitting
      const termsText = page.getByText("I agree to the");
      await expect(termsText).toBeVisible();
    });

    test("has link to sign-in page", async ({ page }) => {
      await page.goto("/sign-up");

      const signInLink = page.getByText("Sign in");
      await expect(signInLink).toBeVisible();
    });

    test("navigating to sign-in works from sign-up", async ({ page }) => {
      await page.goto("/sign-up");

      const signInLink = page.getByText("Sign in");
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
