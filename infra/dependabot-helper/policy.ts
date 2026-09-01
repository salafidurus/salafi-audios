export type DependencyOwner = "dependabot" | "helper-update" | "helper-check";
export type DependencyUpdateType = "major" | "minor" | "patch";

export interface DependencyFamily {
  name: string;
  packages: string[];
  workspaces?: string[];
  mode: DependencyOwner;
  pipeline?: string;
  checker?: "exact-version" | string;
  versionLocked?: boolean;
  updateTypes?: DependencyUpdateType[];
  excludePackages?: string[];
}

export interface DependencyAutomationPolicy {
  defaultOwner: "dependabot";
  families: DependencyFamily[];
}

const expoPackages = [
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
  "@shopify/flash-list",
];

/** Canonical typed ownership policy for auxiliary dependency automation. */
export const dependabotHelperPolicy: DependencyAutomationPolicy = {
  defaultOwner: "dependabot",
  families: [
    {
      name: "prisma",
      packages: ["prisma", "@prisma/*"],
      mode: "helper-check",
      checker: "exact-version",
      versionLocked: true,
    },
    {
      name: "better-auth",
      packages: ["better-auth", "@better-auth/*"],
      mode: "helper-check",
      checker: "exact-version",
      versionLocked: true,
    },
    {
      name: "expo",
      packages: expoPackages,
      workspaces: ["apps/native"],
      mode: "helper-update",
      pipeline: "expo-sdk",
    },
    {
      name: "jest-pair",
      packages: ["jest", "@types/jest"],
      mode: "dependabot",
      updateTypes: ["minor", "patch"],
    },
    {
      name: "jest-family",
      packages: ["jest-*", "@jest/*", "ts-jest"],
      mode: "dependabot",
      excludePackages: ["jest-expo"],
    },
    {
      name: "testing-library-web",
      packages: ["@testing-library/dom", "@testing-library/jest-dom", "@testing-library/react"],
      mode: "dependabot",
    },
  ],
};

function asPatterns(patterns: string[]): string[] {
  return patterns.length > 0 ? patterns : ["*"];
}

function matches(value: string, pattern: string): boolean {
  if (pattern === "*") return true;
  const parts = pattern.split("*");
  if (parts.length === 1) return value === pattern;
  if (!value.startsWith(parts[0]!) || !value.endsWith(parts.at(-1)!)) return false;
  let cursor = 0;
  for (const part of parts) {
    if (part.length === 0) continue;
    const index = value.indexOf(part, cursor);
    if (index < 0) return false;
    cursor = index + part.length;
  }
  return true;
}

function patternsOverlap(left: string, right: string): boolean {
  if (left === "*" || right === "*") return true;
  if (!left.includes("*") && !right.includes("*")) return left === right;
  if (!left.includes("*")) return matches(left, right);
  if (!right.includes("*")) return matches(right, left);

  const leftParts = left.split("*");
  const rightParts = right.split("*");
  const leftPrefix = leftParts[0]!;
  const rightPrefix = rightParts[0]!;
  const leftSuffix = leftParts.at(-1)!;
  const rightSuffix = rightParts.at(-1)!;
  const prefixesCompatible =
    leftPrefix.length === 0 ||
    rightPrefix.length === 0 ||
    leftPrefix.startsWith(rightPrefix) ||
    rightPrefix.startsWith(leftPrefix);
  const suffixesCompatible =
    leftSuffix.length === 0 ||
    rightSuffix.length === 0 ||
    leftSuffix.endsWith(rightSuffix) ||
    rightSuffix.endsWith(leftSuffix);
  return prefixesCompatible && suffixesCompatible;
}

function familyIncludes(family: DependencyFamily, packageName: string): boolean {
  return (
    family.packages.some((pattern) => matches(packageName, pattern)) &&
    !(family.excludePackages ?? []).some((pattern) => matches(packageName, pattern))
  );
}

/** Returns whether a dependency belongs to a family after that family's exclusions. */
export function matchesDependencyFamily(family: DependencyFamily, packageName: string): boolean {
  return familyIncludes(family, packageName);
}

/** Finds the policy family that owns or checks a dependency in a workspace. */
export function resolveDependencyFamily(
  policy: DependencyAutomationPolicy,
  packageName: string,
  workspacePath: string,
): DependencyFamily | null {
  return (
    policy.families.find(
      (family) =>
        familyIncludes(family, packageName) &&
        asPatterns(family.workspaces ?? ["*"]).some((pattern) => matches(workspacePath, pattern)),
    ) ?? null
  );
}

function patternCoveredByIgnore(pattern: string, ignoredPatterns: string[]): boolean {
  return ignoredPatterns.some((ignored) => {
    if (ignored === "*") return true;
    if (!pattern.includes("*")) return matches(pattern, ignored);
    if (!ignored.includes("*")) return false;
    return patternsOverlap(pattern, ignored);
  });
}

/**
 * Validates ownership invariants and returns all failures for one CLI report.
 */
export function validatePolicy(
  policy: DependencyAutomationPolicy,
  dependabotIgnoredPatterns: string[],
): string[] {
  const errors: string[] = [];
  const names = new Set<string>();

  for (const family of policy.families) {
    if (names.has(family.name)) errors.push(`family '${family.name}' is declared more than once`);
    names.add(family.name);
    if (family.packages.length === 0) errors.push(`family '${family.name}' must declare packages`);
    if (family.mode === "helper-update" && !family.pipeline) {
      errors.push(`family '${family.name}' is helper-owned but has no pipeline`);
    }
    if (family.versionLocked && family.checker !== "exact-version") {
      errors.push(`family '${family.name}' is version-locked but has no exact-version checker`);
    }
    if (family.mode === "helper-update") {
      const uncovered = family.packages.filter(
        (pattern) => !patternCoveredByIgnore(pattern, dependabotIgnoredPatterns),
      );
      for (const pattern of uncovered)
        errors.push(
          `helper-owned family '${family.name}' is not fully ignored by Dependabot: ${pattern}`,
        );
    }
  }

  for (let leftIndex = 0; leftIndex < policy.families.length; leftIndex += 1) {
    const left = policy.families[leftIndex]!;
    for (const right of policy.families.slice(leftIndex + 1)) {
      const overlappingPackage = left.packages
        .flatMap((leftPattern) =>
          right.packages.map((rightPattern) => ({ leftPattern, rightPattern })),
        )
        .find(({ leftPattern, rightPattern }) => {
          if (!patternsOverlap(leftPattern, rightPattern)) return false;
          const packageName = !leftPattern.includes("*") ? leftPattern : rightPattern;
          return familyIncludes(left, packageName) && familyIncludes(right, packageName);
        });
      const packageOverlap = overlappingPackage !== undefined;
      const workspaceOverlap = asPatterns(left.workspaces ?? ["*"]).some((leftPattern) =>
        asPatterns(right.workspaces ?? ["*"]).some((rightPattern) =>
          patternsOverlap(leftPattern, rightPattern),
        ),
      );
      if (packageOverlap && workspaceOverlap) {
        const packageName = !overlappingPackage!.leftPattern.includes("*")
          ? overlappingPackage!.leftPattern
          : overlappingPackage!.rightPattern;
        const workspace = (left.workspaces ?? ["*"]).find((leftPattern) =>
          (right.workspaces ?? ["*"]).some((rightPattern) =>
            patternsOverlap(leftPattern, rightPattern),
          ),
        )!;
        errors.push(
          `families '${left.name}' and '${right.name}' overlap for '${packageName}' in '${workspace}'`,
        );
      }
    }
  }

  return errors;
}
