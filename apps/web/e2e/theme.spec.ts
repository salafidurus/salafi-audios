import { test, expect } from "./test-base";

test.describe("Theme — system-preference based", () => {
  test("page loads with a data-theme attribute on <html>", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    await expect(page.locator("html")).toHaveAttribute("data-theme", /^(light|dark)$/);
  });

  test("light color scheme results in light theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/", { waitUntil: "load" });

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("dark color scheme results in dark theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/", { waitUntil: "load" });

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("theme applies different CSS variables for light vs dark", async ({ page }) => {
    // Verify light theme surface color
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    const lightBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--surface-canvas").trim(),
    );
    expect(lightBg).toBeTruthy();

    // Switch to dark and verify the value changes
    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    const darkBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--surface-canvas").trim(),
    );
    expect(darkBg).toBeTruthy();
    expect(darkBg).not.toBe(lightBg);
  });

  test("theme persists across navigation", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Navigate to another page
    await page.goto("/feed", { waitUntil: "load" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  // No explicit theme toggle UI exists — theme follows system preference.
  test("theme toggle switches between light and dark", async () => {
    test.skip(true, "No manual theme toggle UI exists; theme follows system preference");
  });
});
