import { describe, expect, it } from "bun:test";

import {
  dependabotHelperPolicy,
  resolveDependencyFamily,
  validatePolicy,
  type DependencyAutomationPolicy,
} from "./policy";

describe("Dependabot Helper policy", () => {
  it("classifies the approved ownership families", () => {
    expect(dependabotHelperPolicy.defaultOwner).toBe("dependabot");
    expect(dependabotHelperPolicy.families).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "prisma", mode: "helper-check" }),
        expect.objectContaining({ name: "better-auth", mode: "helper-check" }),
        expect.objectContaining({ name: "expo", mode: "helper-update" }),
      ]),
    );

    const expo = dependabotHelperPolicy.families.find((family) => family.name === "expo");
    expect(expo?.packages).toContain("jest-expo");
    expect(expo?.pipeline).toBe("expo-sdk");
  });

  it("preserves the exact Jest pair minor/patch policy", () => {
    expect(dependabotHelperPolicy.families).toContainEqual(
      expect.objectContaining({
        name: "jest-pair",
        mode: "dependabot",
        packages: ["jest", "@types/jest"],
        updateTypes: ["minor", "patch"],
      }),
    );
  });

  it("routes representative update and check paths through classified families", () => {
    expect(resolveDependencyFamily(dependabotHelperPolicy, "expo", "apps/native")).toEqual(
      expect.objectContaining({ name: "expo", mode: "helper-update", pipeline: "expo-sdk" }),
    );
    expect(resolveDependencyFamily(dependabotHelperPolicy, "prisma", "apps/api")).toEqual(
      expect.objectContaining({ name: "prisma", mode: "helper-check", checker: "exact-version" }),
    );
  });

  it("accepts the repository policy and its Dependabot exclusions", () => {
    expect(
      validatePolicy(dependabotHelperPolicy, [
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
      ]),
    ).toEqual([]);
  });

  it("rejects overlapping family definitions", () => {
    const policy: DependencyAutomationPolicy = {
      ...dependabotHelperPolicy,
      families: [
        ...dependabotHelperPolicy.families,
        {
          name: "ambiguous-expo",
          packages: ["expo"],
          workspaces: ["apps/native"],
          mode: "dependabot",
        },
      ],
    };

    expect(validatePolicy(policy, [])).toContain(
      "families 'expo' and 'ambiguous-expo' overlap for 'expo' in 'apps/native'",
    );
  });

  it("rejects locked families without exact-version checkers", () => {
    const policy: DependencyAutomationPolicy = {
      ...dependabotHelperPolicy,
      families: dependabotHelperPolicy.families.map((family) =>
        family.name === "prisma" ? { ...family, checker: undefined } : family,
      ),
    };

    expect(validatePolicy(policy, [])).toContain(
      "family 'prisma' is version-locked but has no exact-version checker",
    );
  });

  it("rejects helper-owned families without a pipeline", () => {
    const policy: DependencyAutomationPolicy = {
      ...dependabotHelperPolicy,
      families: dependabotHelperPolicy.families.map((family) =>
        family.name === "expo" ? { ...family, pipeline: undefined } : family,
      ),
    };

    expect(validatePolicy(policy, [])).toContain(
      "family 'expo' is helper-owned but has no pipeline",
    );
  });

  it("rejects helper-owned packages that are not ignored by Dependabot", () => {
    expect(validatePolicy(dependabotHelperPolicy, ["expo", "expo-*", "@expo/*"])).toContain(
      "helper-owned family 'expo' is not fully ignored by Dependabot: jest-expo",
    );
  });
});
