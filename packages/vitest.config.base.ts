import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    environment: "jsdom",
    clearMocks: true,
    retry: 2,
    passWithNoTests: true,
  },
});
