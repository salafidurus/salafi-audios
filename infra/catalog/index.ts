export type {
  PackageJson,
  Workspace,
  Catalogs,
  CatalogIssue,
  CatalogDuplicate,
  CatalogConfigGroup,
  CatalogConfig,
  CatalogPolicyMode,
  CatalogUpdateCeiling,
  DependencySection,
  CatalogPolicyRule,
  CatalogCompatibilityGroup,
  CatalogPolicyMatch,
  CatalogRepairMutation,
  CatalogRepairReport,
  CatalogUpdateDecision,
  CatalogStats,
} from "./types";

export {
  parseCatalogs,
  getWorkspaces,
  loadConfig,
  getDependencyGroup,
  sanitizeGroupName,
  matchPattern,
  resolveCompatibilityGroup,
} from "./helpers";

export { getAllPackages } from "./scanner/shared";

export { runCatalogCheck } from "./scanner/check";

export { runCatalogFix } from "./scanner/fix";
export type { CatalogFixOptions, CatalogFixResult } from "./scanner/fix";

export { runCatalogFixForce } from "./scanner/fix-force";

export { getUnusedCatalogEntries, runCatalogPrune } from "./scanner/prune";

export { runCatalogStats } from "./scanner/stats";

export { evaluateCatalogUpdate, resolveCatalogPolicy } from "./policy";
