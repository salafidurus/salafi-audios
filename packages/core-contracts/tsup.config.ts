import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    http: "src/http.ts",
    "query/index": "src/query/index.ts",
    "query/hooks/index": "src/query/hooks/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  clean: true,
  tsconfig: "tsconfig.build.json",
  external: ["@tanstack/react-query", "react", "zod"],
});
