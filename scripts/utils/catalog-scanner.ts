import fs from "node:fs";
import path from "node:path";
import { Glob } from "bun";

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

export function parseCatalogs(rootJson: PackageJson): Catalogs {
  const workspaces = rootJson.workspaces;
  return {
    default: workspaces?.catalog || {},
    named: (workspaces as any)?.catalogs || {},
  };
}

export function getWorkspaces(rootDir: string): Workspace[] {
  const rootJsonPath = path.join(rootDir, "package.json");
  if (!fs.existsSync(rootJsonPath)) {
    throw new Error(`Root package.json not found at ${rootJsonPath}`);
  }
  const rootJson: PackageJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
  
  const globPatterns = rootJson.workspaces?.packages || ["apps/*", "packages/*"];
  const workspaces: Workspace[] = [];

  for (const pattern of globPatterns) {
    const glob = new Glob(`${pattern}/package.json`);
    for (const relativeFile of glob.scanSync({ cwd: rootDir })) {
      const absPath = path.join(rootDir, relativeFile);
      const pkgJson: PackageJson = JSON.parse(fs.readFileSync(absPath, "utf-8"));
      workspaces.push({
        name: pkgJson.name,
        relativePath: path.dirname(relativeFile),
        absolutePath: path.dirname(absPath),
        packageJsonPath: absPath,
        content: pkgJson,
      });
    }
  }

  return workspaces;
}
