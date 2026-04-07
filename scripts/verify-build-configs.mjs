import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const packagesDir = join(repoRoot, "packages");

const missingConfigs = [];

for (const entry of readdirSync(packagesDir)) {
  const packageDir = join(packagesDir, entry);
  if (!statSync(packageDir).isDirectory()) {
    continue;
  }

  const packageJsonPath = join(packageDir, "package.json");
  if (!existsSync(packageJsonPath)) {
    continue;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const buildScript = packageJson?.scripts?.build;

  if (buildScript !== "tsc -p tsconfig.build.json") {
    continue;
  }

  const buildConfigPath = join(packageDir, "tsconfig.build.json");
  if (!existsSync(buildConfigPath)) {
    missingConfigs.push(`packages/${entry}/tsconfig.build.json`);
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
