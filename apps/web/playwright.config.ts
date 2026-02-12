import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  // Start Next production server for E2E
  webServer: {
    command:
      process.env.PW_SKIP_WEB_BUILD === "1"
        ? "pnpm start -p 3000"
        : "pnpm build && pnpm start -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Add later if you want:
    // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
