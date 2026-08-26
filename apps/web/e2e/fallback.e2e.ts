import { test, expect } from "./test-base";

const missingRoute = "/route-that-does-not-exist";

test.describe("Public not-found fallback", () => {
  test("renders branded recovery chrome and keeps the 404 response", async ({ page }) => {
    const response = await page.goto(missingRoute);

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    const homeLink = page.getByRole("main").getByRole("link", { name: "Back to home" });
    await expect(homeLink).toBeVisible();
    await homeLink.focus();
    await expect(homeLink).toBeFocused();
  });

  test("follows the active Arabic locale and RTL direction", async ({ page, context }) => {
    await context.addCookies([{ name: "locale", value: "ar", url: "http://localhost:3008" }]);
    await page.goto(missingRoute);

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { name: "الصفحة غير موجودة" })).toBeVisible();
    await expect(page.getByRole("link", { name: "العودة إلى الصفحة الرئيسية" })).toBeVisible();
  });

  test("follows the stored dark theme and the system theme", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("theme-preference:v1", "dark");
    });
    await page.goto(missingRoute);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => {
      window.localStorage.removeItem("theme-preference:v1");
    });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});

test.describe("Shell-unavailable fallback", () => {
  test("recovers from an intentional public-shell failure", async ({ page }) => {
    const response = await page.goto("/shell-failure");

    expect(response?.status()).toBe(500);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByText("Salafi Durus")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);

    const homeLink = page.getByRole("link", { name: "Back to home" });
    await expect(homeLink).toHaveAttribute("href", "/");
    await expect(page.getByRole("button", { name: "Reload page" })).toBeVisible();
  });
});
