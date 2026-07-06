import { readdirSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const packagesDir = join(repoRoot, "packages");

const missingConfigs = [];

// Avoid redundant stat calls by reading entries with file types
const entries = readdirSync(packagesDir, { withFileTypes: true });

for (const dirent of entries) {
  if (!dirent.isDirectory()) {
    continue;
  }

  const packageDir = join(packagesDir, dirent.name);
  const packageJsonPath = join(packageDir, "package.json");
  
  // Check existence and read package.json using native Bun.file
  const packageJsonFile = Bun.file(packageJsonPath);
  if (!(await packageJsonFile.exists())) {
    continue;
  }

  const packageJson = await packageJsonFile.json();
  const buildScript = packageJson?.scripts?.build;

  if (buildScript !== "tsc -p tsconfig.build.json") {
    continue;
  }

  // Check existence of tsconfig.build.json using Bun.file
  const buildConfigPath = join(packageDir, "tsconfig.build.json");
  const buildConfigFile = Bun.file(buildConfigPath);
  if (!(await buildConfigFile.exists())) {
    missingConfigs.push(`packages/${dirent.name}/tsconfig.build.json`);
  }
}

if (missingConfigs.length > 0) {
  console.error("Missing tsconfig.build.json for package build scripts:");
  for (const configPath of missingConfigs) {
    console.error(`- ${configPath}`);
  }
  process.exit(1);
}

console.log("verify-build-configs: ok");
