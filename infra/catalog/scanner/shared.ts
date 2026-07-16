import fs from "node:fs";
import path from "node:path";
import { getWorkspaces } from "../helpers";
import type { PackageJson } from "../types";

export interface DepUsage {
  depName: string;
  version: string;
  pkgName: string;
  relativePath: string;
  filePath: string;
  depType: "dependencies" | "devDependencies";
}

export function getAllPackages(rootDir: string) {
  const rootJsonPath = path.join(rootDir, "package.json");
  const rootJson: PackageJson = JSON.parse(fs.readFileSync(rootJsonPath, "utf-8"));
  const workspaces = getWorkspaces(rootDir);
  return {
    rootJson,
    workspaces,
    allPackages: [
      { name: "root", content: rootJson, relativePath: "" },
      ...workspaces.map((w) => ({
        name: w.name,
        content: w.content,
        relativePath: w.relativePath,
      })),
    ],
  };
}
