import { test, expect } from "./test-base";

const sessionResponse = {
  session: {
    id: "callback-session",
    userId: "callback-user",
    expiresAt: "2030-01-01T00:00:00.000Z",
  },
  user: {
    id: "callback-user",
    name: "Callback User",
    email: "callback@example.com",
    emailVerified: true,
    image: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
};

test.describe("Authentication callback fallback", () => {
  test("renders loading recovery chrome without unrelated shell features", async ({ page }) => {
    await page.route("**/api/auth/get-session", async () => {
      await new Promise<void>(() => {});
    });
    await page.goto("/auth/callback?redirect=/explore");

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByText("Completing sign-in...")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore" })).toBeVisible();
    await expect(page.getByRole("button", { name: /close player/i })).toHaveCount(0);
    await expect(page.locator('script[src*="vexo"]')).toHaveCount(0);
    await expect(page.getByRole("region", { name: /cookies and analytics/i })).toHaveCount(0);

    const exploreLink = page.getByRole("link", { name: "Explore" });
    await exploreLink.focus();
    await expect(exploreLink).toBeFocused();
  });

  test("renders timeout recovery inside the public shell", async ({ page }) => {
    test.setTimeout(30_000);
    await page.route("**/api/auth/get-session", async () => {
      await new Promise<void>(() => {});
    });
    await page.goto("/auth/callback");

    await expect(page.getByRole("heading", { name: "Authentication Timeout" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("link", { name: "Please try again" })).toBeVisible();
  });

  test("renders authentication errors with sign-in recovery", async ({ page }) => {
    await page.route("**/api/auth/get-session", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "Provider failed" } }),
      });
    });
    await page.goto("/auth/callback");

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Authentication Error" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Try again" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("redirects successful verification to the validated requested destination", async ({
    page,
  }) => {
    await page.route("**/api/auth/get-session", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(sessionResponse),
      });
    });
    await page.goto("/auth/callback?redirect=/explore");

    await expect(page).toHaveURL(/\/explore$/);
  });
});
