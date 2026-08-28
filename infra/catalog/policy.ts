import type {
  CatalogConfig,
  CatalogPolicyMatch,
  CatalogPolicyRule,
  CatalogUpdateDecision,
  CatalogUpdateCeiling,
  DependencySection,
} from "./types";

import { getDependencyGroup, matchPattern } from "./helpers";

function specificity(rule: CatalogPolicyRule, dependency: string, workspace: string): number {
  const packagePatterns = Array.isArray(rule.packages) ? rule.packages : [rule.packages];
  const workspacePatterns = Array.isArray(rule.workspaces) ? rule.workspaces : [rule.workspaces];
  return (
    (packagePatterns.includes(dependency) ? 4 : 0) +
    (workspacePatterns.includes(workspace) ? 2 : 0) +
    (rule.sections ? 1 : 0)
  );
}

export function resolveCatalogPolicy(
  dependency: string,
  workspace: string,
  section: DependencySection,
  config: CatalogConfig,
): CatalogPolicyMatch {
  const candidates = config.policies.filter(
    (rule) =>
      matchPattern(dependency, rule.packages) &&
      matchPattern(workspace, rule.workspaces) &&
      (!rule.sections || rule.sections.includes(section)),
  );

  if (candidates.length === 0) {
    const group = getDependencyGroup(dependency, workspace, config);
    return {
      status: "default",
      reason: group
        ? `uses existing catalog group '${group}'`
        : "no explicit policy applies; existing catalog behavior remains the default",
    };
  }

  const ranked = candidates
    .map((rule) => ({ rule, score: specificity(rule, dependency, workspace) }))
    .sort((left, right) => right.score - left.score);
  const best = ranked[0]!;
  const tied: CatalogPolicyRule[] = [];
  for (const entry of ranked) {
    if (entry.score === best.score) tied.push(entry.rule);
  }

  if (tied.length > 1) {
    return {
      status: "ambiguous",
      candidates: tied,
      reason: `multiple catalog policies match '${dependency}' in '${workspace}' with equal specificity`,
    };
  }

  return { status: "matched", rule: best.rule, reason: best.rule.reason };
}

function versionParts(value: string): [number, number, number] | null {
  const match = value.replace(/^[^0-9]*/, "").match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

function versionPrefix(value: string): "" | "^" | "~" {
  const prefix = value.match(/^[\^~]/)?.[0];
  if (prefix === "^") return "^";
  if (prefix === "~") return "~";
  return "";
}

function bumpLevel(current: [number, number, number], next: [number, number, number]) {
  if (next[0] !== current[0]) return "major" as const;
  if (next[1] !== current[1]) return "minor" as const;
  return "patch" as const;
}

export function evaluateCatalogUpdate(
  rule: CatalogPolicyRule | undefined,
  currentVersion: string,
  nextVersion: string,
): CatalogUpdateDecision {
  if (!rule) return { status: "allowed", reason: "no explicit update policy applies" };

  if (rule.rangePrefix !== undefined && versionPrefix(nextVersion) !== rule.rangePrefix) {
    return {
      status: "rejected",
      reason: `policy '${rule.name}' requires the '${rule.rangePrefix || "exact"}' range prefix`,
    };
  }

  if (rule.updateCeiling === "fixed") {
    return nextVersion === rule.fixedVersion
      ? { status: "allowed", reason: rule.reason }
      : {
          status: "rejected",
          reason: `policy '${rule.name}' only permits fixed version '${rule.fixedVersion}'`,
        };
  }

  const current = versionParts(currentVersion);
  const next = versionParts(nextVersion);
  if (!current || !next) {
    return { status: "rejected", reason: "cannot evaluate a non-semver dependency update safely" };
  }
  const downgrade =
    next[0] < current[0] ||
    (next[0] === current[0] && next[1] < current[1]) ||
    (next[0] === current[0] && next[1] === current[1] && next[2] < current[2]);
  if (downgrade) {
    return {
      status: "rejected",
      reason: "dependency updates must not downgrade the current version",
    };
  }

  const ceiling: CatalogUpdateCeiling = rule.updateCeiling ?? "major";
  const level = bumpLevel(current, next);
  const allowed =
    ceiling === "major" || ceiling === level || (ceiling === "minor" && level === "patch");
  return allowed
    ? { status: "allowed", reason: rule.reason }
    : { status: "rejected", reason: `policy '${rule.name}' permits ${ceiling}-level updates only` };
}
