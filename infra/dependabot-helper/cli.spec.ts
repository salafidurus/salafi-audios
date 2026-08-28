import { describe, expect, it } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { extractDependabotIgnoredPatterns, validateRepositoryPolicy } from "./cli";

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

  it("validates without requiring legacy catalog or pkg-update policy files", () => {
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
});
