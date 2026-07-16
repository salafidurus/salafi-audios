export type {
  PackageJson,
  Workspace,
  Catalogs,
  CatalogIssue,
  CatalogDuplicate,
  CatalogConfigGroup,
  CatalogConfig,
  CatalogStats,
} from "./types";

export {
  parseCatalogs,
  getWorkspaces,
  loadConfig,
  getDependencyGroup,
  sanitizeGroupName,
  matchPattern,
} from "./helpers";

export { getAllPackages } from "./scanner/shared";

export { runCatalogCheck } from "./scanner/check";

export { runCatalogFix } from "./scanner/fix";

export { runCatalogFixForce } from "./scanner/fix-force";

export { getUnusedCatalogEntries, runCatalogPrune } from "./scanner/prune";

export { runCatalogStats } from "./scanner/stats";
