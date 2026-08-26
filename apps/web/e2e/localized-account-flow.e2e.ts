import type { Page } from "@playwright/test";

import { test, expect } from "./test-base";

const user = {
  id: "flow-user",
  name: "Flow User",
  email: "flow@example.com",
};

async function mockAuthenticatedUser(page: Page) {
  await page.context().addCookies([
    {
      name: "better-auth.session_token",
      value: `session-${user.id}`,
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.route("**/api/auth/get-session", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        session: {
          id: `session-${user.id}`,
          userId: user.id,
          expiresAt: "2030-01-01T00:00:00.000Z",
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: true,
          image: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route("**/account/profile", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        ...user,
        avatarUrl: null,
        displayName: user.name,
        emailVerified: true,
        roles: [],
        rules: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    });
  });
}

test.describe("complete localized My Library and Settings flow", () => {
  test("supports direct and in-app canonical navigation", async ({ page }) => {
    const libraryResponse = await page.goto("/my-library?tab=saved");

    expect(libraryResponse?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "My Library", level: 1 })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Saved" })).toHaveAttribute("aria-selected", "true");
    await page.reload();
    await expect(page).toHaveURL("/my-library?tab=saved");
    await expect(page.getByRole("tab", { name: "Saved" })).toHaveAttribute("aria-selected", "true");

    await page.goto("/");
    const accountButton = page.getByRole("button", { name: "Account: Guest" });
    await expect(accountButton).toBeVisible();
    await accountButton.click();
    const accountMenu = page.getByRole("menu", { name: "Account" });
    await expect(accountMenu).toBeVisible();
    await accountMenu
      .getByRole("menuitem", {
        name: "Settings",
      })
      .click();
    await expect(page).toHaveURL(/\/settings$/);
    await expect(page.getByRole("heading", { name: "Settings", level: 1 })).toBeVisible();

    await page.getByRole("tab", { name: "Profile" }).click();
    await expect(page).toHaveURL("/settings?tab=profile");
    await page.reload();
    await expect(page.getByRole("tab", { name: "Profile" })).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  test("keeps anonymous personal routes in place and removes legacy aliases", async ({ page }) => {
    await page.goto("/my-library?tab=saved");
    await expect(page).toHaveURL("/my-library?tab=saved");
    await expect(
      page.getByRole("heading", { name: "Sign in to view saved lectures" }),
    ).toBeVisible();

    await page.goto("/settings?tab=profile");
    await expect(page).toHaveURL("/settings?tab=profile");
    await expect(page).not.toHaveURL(/\/sign-in/);

    for (const legacyPath of [
      "/library",
      "/library/saved",
      "/library/completed",
      "/settings/profile",
    ]) {
      const response = await page.goto(legacyPath);
      expect(response?.status(), legacyPath).toBe(404);
      await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`${legacyPath.replaceAll("/", "\\/")}$`));
    }
  });

  test("completes a successful sign-out without an intermediate sign-in state", async ({
    page,
  }) => {
    await mockAuthenticatedUser(page);
    await page.route("**/auth/sign-out", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto("/settings?tab=profile");
    await expect(page.getByTestId("sign-out-trigger")).toBeVisible();
    await page.getByTestId("sign-out-trigger").click();
    await page.getByTestId("confirm-modal-confirm").click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  });

  test("retains the sign-out dialog and localized error when sign-out fails", async ({ page }) => {
    await mockAuthenticatedUser(page);
    await page.route("**/auth/sign-out", async (route) => {
      await route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
    });

    await page.goto("/settings?tab=profile");
    await page.getByTestId("sign-out-trigger").click();
    await page.getByTestId("confirm-modal-confirm").click();

    await expect(page).toHaveURL("/settings?tab=profile");
    await expect(page.getByTestId("confirm-modal")).toBeVisible();
    await expect(page.getByTestId("confirm-modal").getByRole("alert")).toHaveText(
      "Sign out failed. Please try again.",
    );
  });

  test("resolves cookie consent before showing the banner and preserves acceptance", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("aside")).toHaveCount(0);

    await page.evaluate(() => {
      localStorage.removeItem("cookie-consent:v1");
      window.dispatchEvent(new CustomEvent("cookie-consent-change"));
    });
    const banner = page.locator("aside");
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Close" }).click();
    await expect(banner).toHaveCount(0);

    await page.reload();
    await expect(page.locator("aside")).toHaveCount(0);
  });

  test("preserves Arabic copy, RTL layout, and narrow-screen tab usability", async ({
    page,
    context,
  }) => {
    await context.addCookies([{ name: "locale", value: "ar", domain: "localhost", path: "/" }]);
    await page.goto("/settings?tab=profile");

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { name: "الإعدادات", level: 1 })).toBeVisible();
    await expect(page.getByRole("tab", { name: "الملف الشخصي" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test.describe("responsive layout", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("keeps Settings and My Library controls usable on mobile", async ({ page }) => {
      await page.goto("/my-library");
      await expect(page.getByRole("tablist", { name: "My Library sections" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Completed" })).toBeVisible();

      await page.goto("/settings");
      await expect(page.getByRole("tablist", { name: "Settings sections" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Profile" })).toBeVisible();
    });
  });
});
