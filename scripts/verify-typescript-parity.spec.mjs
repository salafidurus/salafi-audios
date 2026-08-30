import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { collectParityFailures } from "./verify-typescript-parity.mjs";

function createFixture(files) {
  const root = mkdtempSync(join(tmpdir(), "sd-typescript-parity-"));

  for (const [relativePath, contents] of Object.entries(files)) {
    const filePath = join(root, relativePath);
    mkdirSync(join(filePath, ".."), { recursive: true });
    writeFileSync(filePath, contents);
  }

  return root;
}

describe("TypeScript parity evidence", () => {
  test("rejects a non-TypeScript-7 primary compiler and compatibility typecheck command", () => {
    const root = createFixture({
      "package.json": JSON.stringify({
        scripts: { typecheck: "bun run typecheck:compat" },
        devDependencies: { typescript: "5.9.3" },
      }),
    });

    expect(collectParityFailures(root)).toEqual(
      expect.arrayContaining([
        "The root typecheck script must remain `turbo run typecheck`.",
        "The primary TypeScript dependency must be version 7.",
      ]),
    );
  });

  test("accepts the TypeScript 7-owned compiler and required platform settings", () => {
    const root = createFixture({
      "package.json": JSON.stringify({
        scripts: { typecheck: "turbo run typecheck" },
        devDependencies: {
          typescript: "7.0.2",
          "oxlint-plugin-react-doctor": "0.9.12",
          "react-doctor": "0.9.12",
        },
      }),
      "apps/native/tsconfig.json": JSON.stringify({
        compilerOptions: { moduleSuffixes: [".native", ""] },
      }),
      "infra/dependabot-helper/tsconfig.json": JSON.stringify({
        compilerOptions: { rootDir: "../.." },
      }),
      ".github/workflows/react-doctor.yml": "millionco/react-doctor@v2\nblocking: warning\n",
    });

    expect(collectParityFailures(root)).toEqual([]);
  });

  test("reports missing declaration and generated-client artifacts after a build", () => {
    const root = createFixture({
      "package.json": JSON.stringify({
        scripts: { typecheck: "turbo run typecheck" },
        devDependencies: {
          typescript: "7.0.2",
          "oxlint-plugin-react-doctor": "0.9.12",
          "react-doctor": "0.9.12",
        },
      }),
    });

    expect(collectParityFailures(root, { requireArtifacts: true })).toEqual(
      expect.arrayContaining([
        "Missing TypeScript parity artifact: packages/core-api/dist/index.d.ts.",
        "Missing TypeScript parity artifact: packages/core-db/src/generated/prisma/client.d.ts.",
      ]),
    );
  });
});
