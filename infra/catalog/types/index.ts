export interface PackageJson {
  name: string;
  version?: string;
  workspaces?: {
    packages?: string[];
    catalog?: Record<string, string>;
    catalogs?: Record<string, Record<string, string>>;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface Workspace {
  name: string;
  relativePath: string;
  absolutePath: string;
  packageJsonPath: string;
  content: PackageJson;
}

export interface Catalogs {
  default: Record<string, string>;
  named: Record<string, Record<string, string>>;
}

export interface CatalogIssue {
  type: "missing" | "mismatch" | "hardcoded" | "orphan" | "policy";
  pkgName: string;
  depName: string;
  expectedVersion?: string;
  actualVersion?: string;
  details: string;
}

export interface CatalogDuplicate {
  depName: string;
  workspaces: string[];
  versions: string[];
}

export interface CatalogConfigGroup {
  name: string;
  packages: string | string[];
  workspaces: string | string[];
}

export type CatalogPolicyMode = "managed" | "explicit" | "ignored";

export type CatalogUpdateCeiling = "patch" | "minor" | "major" | "fixed";

export type DependencySection = "dependencies" | "devDependencies" | "peerDependencies";

export interface CatalogPolicyRule {
  name: string;
  packages: string | string[];
  workspaces: string | string[];
  mode?: CatalogPolicyMode;
  rangePrefix?: "" | "^" | "~";
  updateCeiling?: CatalogUpdateCeiling;
  fixedVersion?: string;
  owner?: string;
  compatibilityGroup?: string;
  sections?: DependencySection[];
  reason: string;
}

export interface CatalogCompatibilityGroup {
  name: string;
  packages: string | string[];
  workspaces: string | string[];
  owner: string;
  target?: {
    resolver: string;
    value?: string;
  };
  catalogMode?: CatalogPolicyMode;
  validationCommands?: string[];
}

export interface CatalogConfig {
  groups: CatalogConfigGroup[];
  policies: CatalogPolicyRule[];
  compatibilityGroups?: CatalogCompatibilityGroup[];
}

export interface CatalogPolicyMatch {
  status: "matched" | "default" | "ambiguous";
  rule?: CatalogPolicyRule;
  candidates?: CatalogPolicyRule[];
  reason: string;
}

export interface CatalogUpdateDecision {
  status: "allowed" | "rejected";
  reason: string;
}

export interface CatalogRepairMutation {
  filePath: string;
  workspace: string;
  dependency: string;
  section: DependencySection;
  before: string;
  after: string;
  rule?: string;
  reason: string;
}

export interface CatalogRepairReport {
  status: "applied" | "planned" | "no-op" | "rejected" | "invalid";
  mutations: CatalogRepairMutation[];
  updatedFiles: string[];
  issues: CatalogIssue[];
  reason?: string;
  lockfile: "unchanged" | "requires-install" | "validated";
}

export interface CatalogStats {
  overview: {
    totalWorkspaces: number;
    uniqueExternalDeps: number;
    eligibleDeps: number;
    correctlyCataloged: number;
    uncataloged: number;
    miscatalogued: number;
    coveragePercent: number;
  };
  entries: {
    default: number;
    named: { name: string; entries: number }[];
    total: number;
  };
  perWorkspace: {
    name: string;
    relativePath: string;
    totalDeps: number;
    catalogedEligible: number;
    percent: number;
  }[];
  candidates: {
    depName: string;
    groups: { version: string; workspaces: string[] }[];
  }[];
  unused: {
    default: string[];
    named: { group: string; entries: string[] }[];
    total: number;
  };
  alignment: {
    issues: number;
    duplicates: number;
  };
}
