import { describe, expect, it } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { checkRepository, extractDependabotIgnoredPatterns, validateRepositoryPolicy } from "./cli";

const rootDir = resolve(import.meta.dirname, "../..");

describe("Dependabot Helper CLI boundary", () => {
  it("extracts dependency-name entries from native Dependabot ignore rules", () => {
    expect(
      extractDependabotIgnoredPatterns(`
        ignore:
          - dependency-name: "expo"
          - dependency-name: "@expo/*"
      `),
    ).toEqual(["expo", "@expo/*"]);
  });

  it("validates the repository policy through the helper entry point", () => {
    expect(validateRepositoryPolicy(rootDir)).toEqual([]);
  });

  it("validates without requiring retired policy files", () => {
    const fixtureRoot = mkdtempSync(resolve(tmpdir(), "dependabot-helper-test-"));
    mkdirSync(resolve(fixtureRoot, ".github"));
    writeFileSync(
      resolve(fixtureRoot, ".github/dependabot.yml"),
      [
        '      - dependency-name: "expo"',
        '      - dependency-name: "expo-*"',
        '      - dependency-name: "@expo/*"',
        '      - dependency-name: "jest-expo"',
        '      - dependency-name: "react"',
        '      - dependency-name: "react-dom"',
        '      - dependency-name: "@types/react"',
        '      - dependency-name: "@types/react-dom"',
        '      - dependency-name: "react-native"',
        '      - dependency-name: "react-native-*"',
        '      - dependency-name: "@react-native/*"',
        '      - dependency-name: "@react-navigation/*"',
        '      - dependency-name: "@sentry/*"',
        '      - dependency-name: "@react-native-async-storage/*"',
      ].join("\n"),
    );

    expect(validateRepositoryPolicy(fixtureRoot)).toEqual([]);
  });

  it("runs helper checks through classified policy families without proposing updates", () => {
    expect(checkRepository(rootDir)).toEqual({ accepted: true, errors: [] });
  });

  it("rejects exact-version drift in a checked family", () => {
    const fixtureRoot = mkdtempSync(resolve(tmpdir(), "dependabot-helper-check-"));
    mkdirSync(resolve(fixtureRoot, ".github"));
    writeFileSync(
      resolve(fixtureRoot, "package.json"),
      JSON.stringify({ workspaces: { catalog: {} } }),
    );
    writeFileSync(
      resolve(fixtureRoot, ".github/dependabot.yml"),
      [
        "expo",
        "expo-*",
        "@expo/*",
        "jest-expo",
        "react",
        "react-dom",
        "@types/react",
        "@types/react-dom",
        "react-native",
        "react-native-*",
        "@react-native/*",
        "@react-navigation/*",
        "@sentry/*",
        "@react-native-async-storage/*",
      ]
        .map((name) => `      - dependency-name: "${name}"`)
        .join("\n"),
    );
    mkdirSync(resolve(fixtureRoot, "apps/api"), { recursive: true });
    mkdirSync(resolve(fixtureRoot, "packages/core-db"), { recursive: true });
    writeFileSync(
      resolve(fixtureRoot, "apps/api/package.json"),
      JSON.stringify({ dependencies: { prisma: "7.10.0" } }),
    );
    writeFileSync(
      resolve(fixtureRoot, "packages/core-db/package.json"),
      JSON.stringify({ dependencies: { "@prisma/client": "7.10.1" } }),
    );

    expect(checkRepository(fixtureRoot)).toEqual({
      accepted: false,
      errors: [
        "family 'prisma' failed exact-version check: apps/api/prisma=7.10.0, packages/core-db/@prisma/client=7.10.1",
      ],
    });
  });
});
