import { defineConfig, devices } from "@playwright/test";

export function shouldReuseExistingServer(env: Record<string, string | undefined>): boolean {
  return env.PW_REUSE_EXISTING_SERVER === "1";
}

export function getDefaultWorkerCount(env: Record<string, string | undefined>): number {
  const requested = Number(env.PW_WORKERS);
  return Number.isInteger(requested) && requested > 0 ? requested : 1;
}

export function getPlaywrightPort(env: Record<string, string | undefined>): number {
  const requested = Number(env.PW_PORT);
  return Number.isInteger(requested) && requested > 0 && requested <= 65535 ? requested : 3008;
}

const playwrightPort = getPlaywrightPort(process.env);
const playwrightBaseUrl = `http://localhost:${playwrightPort}`;
const playwrightApiUrl = playwrightBaseUrl;
const playwrightWebUrl = playwrightBaseUrl;
// The dedicated fault route is enabled for E2E runs by default. Set this to
// "0" when a run must exercise the route's production-safe notFound guard.
const fallbackTestMode = process.env.PW_FALLBACK_FAULTS !== "0";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  testIgnore: "**/*.bun.e2e.ts",
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
    baseURL: playwrightBaseUrl,
    trace: "on-first-retry",
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },

  // Start Next production server for E2E
  webServer: {
    command:
      process.env.PW_SKIP_WEB_BUILD === "1"
        ? `NEXT_PUBLIC_API_URL=${playwrightApiUrl} NEXT_PUBLIC_WEB_URL=${playwrightWebUrl} FALLBACK_TEST_MODE=${fallbackTestMode ? "1" : "0"} bun --bun next start --port ${playwrightPort}`
        : `NEXT_PUBLIC_API_URL=${playwrightApiUrl} NEXT_PUBLIC_WEB_URL=${playwrightWebUrl} bun run build && NEXT_PUBLIC_API_URL=${playwrightApiUrl} NEXT_PUBLIC_WEB_URL=${playwrightWebUrl} FALLBACK_TEST_MODE=${fallbackTestMode ? "1" : "0"} bun --bun next start --port ${playwrightPort}`,
    url: playwrightBaseUrl,
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
