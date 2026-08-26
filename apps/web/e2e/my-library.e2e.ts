import { expect, test } from "./test-base";

test.describe("My Library", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("loads the canonical route and preserves direct query tab selection", async ({ page }) => {
    const response = await page.goto("/my-library");

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "My Library", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Continue listening" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page not found" })).toHaveCount(0);

    for (const [tab, heading] of [
      ["saved", "Saved"],
      ["completed", "Completed"],
    ] as const) {
      await page.goto(`/my-library?tab=${tab}`);
      await expect(page).toHaveURL(`/my-library?tab=${tab}`);
      await expect(page.getByRole("tab", { name: heading })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });

  test("updates the URL and browser history when switching tabs", async ({ page }) => {
    await page.goto("/my-library");

    await page.getByRole("tab", { name: "Saved" }).click();
    await expect(page).toHaveURL("/my-library?tab=saved");
    await expect(page.getByRole("heading", { name: "Saved" })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/my-library$/);
    await expect(page.getByRole("heading", { name: "Continue listening" })).toBeVisible();
  });

  test("falls back to Started for an invalid tab without a 404", async ({ page }) => {
    await page.goto("/my-library?tab=unknown");

    await expect(page.getByRole("heading", { name: "Continue listening" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page not found" })).toHaveCount(0);
  });

  test("keeps anonymous users in place with an authentication state", async ({ page }) => {
    await page.goto("/my-library?tab=saved");

    await expect(
      page.getByRole("heading", { name: "Sign in to view your saved lessons" }),
    ).toBeVisible();
    await expect(page).toHaveURL("/my-library?tab=saved");
  });

  test("renders Arabic copy with RTL layout", async ({ page, context }) => {
    await context.addCookies([{ name: "locale", value: "ar", domain: "localhost", path: "/" }]);
    await page.goto("/my-library?tab=completed");

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { name: "مكتبتي", level: 1 })).toBeVisible();
    await expect(page.getByRole("tab", { name: "المكتملة" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test.describe("mobile layout", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("keeps My Library tabs usable on narrow screens", async ({ page }) => {
      await page.goto("/my-library");

      const tablist = page.getByRole("tablist", { name: "My Library sections" });
      await expect(tablist).toBeVisible();
      await expect(tablist.getByRole("tab", { name: "Started" })).toBeVisible();
      await expect(tablist.getByRole("tab", { name: "Saved" })).toBeVisible();
      await expect(tablist.getByRole("tab", { name: "Completed" })).toBeVisible();
    });
  });
});
