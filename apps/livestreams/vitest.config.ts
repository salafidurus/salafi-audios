import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    swc.vite({
      module: { type: "es6" },
    }),
  ],
  test: {
    globals: true,
    environment: "node",
    clearMocks: true,
    passWithNoTests: true,
    include: ["src/**/*.spec.ts"],
  },
});
