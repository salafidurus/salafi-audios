import { test, expect } from "@playwright/test";

test("library page shows sign-in prompt for unauthenticated users", async ({ page }) => {
  await page.goto("/library");

  // Check title
  await expect(page).toHaveTitle(/library/i);

  // Check for the empty state message
  const message = page.getByText("Sign in to view your progress, saved lessons, and downloads.");
  await expect(message).toBeVisible();
});
