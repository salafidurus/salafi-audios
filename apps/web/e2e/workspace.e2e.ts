import type { Page } from "@playwright/test";

import { test, expect } from "./test-base";

type WorkspaceRole = "listener" | "scoped-admin" | "superadmin";
type MockUser = { id: string; name: string; email: string };

const users = {
  listener: { id: "listener-1", name: "Listener", email: "listener@example.com" },
  "scoped-admin": { id: "scoped-admin-1", name: "Scoped Admin", email: "scoped@example.com" },
  superadmin: { id: "superadmin-1", name: "Superadmin", email: "superadmin@example.com" },
} satisfies Record<WorkspaceRole, MockUser>;

const rules = {
  listener: [],
  "scoped-admin": [
    ["read", "Scholar"],
    ["read", "Listing"],
  ],
  superadmin: [["manage", "all"]],
} satisfies Record<WorkspaceRole, readonly unknown[][]>;

async function mockRole(page: Page, role: WorkspaceRole) {
  const user = users[role];

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
        avatarUrl: undefined,
        emailVerified: true,
        roles: role === "superadmin" ? ["superadmin"] : [],
        rules: rules[role],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    });
  });

  await page.route("**/admin/users**", async (route) => {
    if (route.request().resourceType() === "document") {
      await route.continue();
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ users: [], nextCursor: null, hasMore: false }),
    });
  });
}

test.describe("complete public and admin workspace journeys", () => {
  test("signed-out listeners can open catalog search with the keyboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin Dashboard" })).toHaveCount(0);

    await page.getByRole("button", { name: "Search catalog" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("combobox", { name: "Search catalog" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("signed-in listeners keep account access without admin capabilities", async ({ page }) => {
    await mockRole(page, "listener");
    await page.goto("/settings");

    await expect(page.getByRole("button", { name: "Account: Listener" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin Dashboard" })).toHaveCount(0);
    await expect(page.getByRole("tablist", { name: "Settings sections" })).toBeVisible();
  });

  test("scoped administrators see only the admin destinations allowed by their rules", async ({
    page,
  }) => {
    await mockRole(page, "scoped-admin");
    await page.goto("/explore");
    await expect(page.getByRole("button", { name: "Account: Scoped Admin" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin Dashboard" })).toBeVisible();
    await page.goto("/admin");

    const navigation = page.getByRole("navigation", { name: "Main" });
    await expect(navigation.getByRole("link", { name: "Scholars" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Contents" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Users" })).toHaveCount(0);

    await page.getByRole("link", { name: "Back to App" }).click();
    await expect(page).toHaveURL(/\/explore$/);
  });

  test("superadmins can reach user access management and all admin destinations", async ({
    page,
  }) => {
    await mockRole(page, "superadmin");
    await page.goto("/explore");
    await expect(page.getByRole("button", { name: "Account: Superadmin" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin Dashboard" })).toBeVisible();
    await page.goto("/admin/users");

    const navigation = page.getByRole("navigation", { name: "Main" });
    await expect(navigation.getByRole("link", { name: "Scholars" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Contents" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /manage users/i })).toBeVisible();
  });

  test.describe("responsive and preference surfaces", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("mobile navigation remains keyboard reachable and supports RTL", async ({ page }) => {
      await page.goto("/settings");
      await page.waitForLoadState("load");

      const menu = page.getByRole("button", { name: "Main" });
      await expect(menu).toBeVisible();
      await menu.focus();
      await expect(menu).toBeFocused();

      await page
        .context()
        .addCookies([{ name: "locale", value: "ar", domain: "localhost", path: "/" }]);
      await page.reload({ waitUntil: "load" });
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    });

    test("theme preference is reflected on the document", async ({ page }) => {
      await page.goto("/settings");
      await page.waitForLoadState("load");

      const theme = page.getByRole("group", { name: "Theme preference" });
      await expect(theme).toBeVisible();
      const dark = theme.getByRole("button", { name: "Dark" });
      await dark.click();
      await expect(dark).toHaveAttribute("aria-pressed", "true");
    });
  });
});
