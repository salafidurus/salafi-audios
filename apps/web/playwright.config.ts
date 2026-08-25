import { defineConfig, devices } from "@playwright/test";

export function shouldReuseExistingServer(env: Record<string, string | undefined>): boolean {
  return env.PW_REUSE_EXISTING_SERVER === "1";
}

export function getDefaultWorkerCount(env: Record<string, string | undefined>): number {
  const requested = Number(env.PW_WORKERS);
  return Number.isInteger(requested) && requested > 0 ? requested : 1;
}

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: getDefaultWorkerCount(process.env),
  reporter: "list",
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: "http://localhost:3008",
    trace: "on-first-retry",
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },

  // Start Next production server for E2E
  webServer: {
    command:
      process.env.PW_SKIP_WEB_BUILD === "1"
        ? "bun --bun next start --port 3008"
        : "bun run build && bun --bun next start --port 3008",
    url: "http://localhost:3008",
    reuseExistingServer: shouldReuseExistingServer(process.env),
    timeout: 120_000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    // Add later if you want:
    // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
