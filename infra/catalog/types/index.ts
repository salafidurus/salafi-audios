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
  type: "missing" | "mismatch" | "hardcoded" | "orphan";
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

export interface CatalogConfig {
  groups: CatalogConfigGroup[];
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
