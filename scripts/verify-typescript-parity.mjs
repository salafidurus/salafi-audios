import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { findMonorepoRoot } from "./utils/paths.mjs";

const EXPECTED_BUILD_ARTIFACTS = {
  "packages/core-api": [
    "dist/index.d.ts",
    "dist/index.d.ts.map",
    "dist/index.js",
    "dist/index.js.map",
  ],
  "packages/core-contracts": [
    "dist/index.d.ts",
    "dist/index.d.ts.map",
    "dist/http.d.ts",
    "dist/http.d.ts.map",
    "dist/index.js",
    "dist/index.mjs",
  ],
  "packages/core-i18n": [
    "dist/index.d.ts",
    "dist/index.d.ts.map",
    "dist/index.js",
    "dist/index.mjs",
  ],
  "packages/design-tokens": [
    "dist/index.d.ts",
    "dist/index.d.ts.map",
    "dist/index.js",
    "dist/index.js.map",
  ],
  "packages/utils-error": [
    "dist/index.d.ts",
    "dist/index.d.ts.map",
    "dist/index.js",
    "dist/index.mjs",
  ],
  "packages/core-db": ["src/generated/prisma/client.d.ts", "dist/index.js", "dist/index.mjs"],
};

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readJsonc(filePath) {
  return JSON.parse(
    readFileSync(filePath, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\s)\/\/.*$/gm, "$1"),
  );
}

function addMissingFiles(failures, rootDir, relativePaths) {
  for (const relativePath of relativePaths) {
    const absolutePath = join(rootDir, relativePath);
    if (!existsSync(absolutePath)) {
      failures.push(`Missing TypeScript parity artifact: ${relativePath}.`);
    }
  }
}

function checkSourceMaps(failures, rootDir, relativePaths) {
  for (const relativePath of relativePaths) {
    const absolutePath = join(rootDir, relativePath);
    if (!existsSync(absolutePath)) {
      continue;
    }
    const sourceMap = readJson(absolutePath);
    if (!Array.isArray(sourceMap.sources) || sourceMap.sources.length === 0) {
      failures.push(`TypeScript source map has no source mappings: ${relativePath}.`);
    }
  }
}

function checkPackageExports(failures, rootDir, packagePath) {
  const packageJsonPath = join(rootDir, packagePath, "package.json");
  if (!existsSync(packageJsonPath)) {
    return;
  }

  const packageJson = readJson(packageJsonPath);
  const targets = [];
  const collectTargets = (value) => {
    const valueTag = Object.prototype.toString.call(value);
    if (valueTag === "[object String]") {
      targets.push(value);
      return;
    }
    if (valueTag === "[object Object]") {
      for (const child of Object.values(value)) {
        collectTargets(child);
      }
    }
  };

  collectTargets(packageJson.exports);
  if (Object.prototype.toString.call(packageJson.types) === "[object String]") {
    targets.push(packageJson.types);
  }

  for (const target of targets) {
    if (!target.startsWith(".")) {
      continue;
    }
    const targetPath = join(rootDir, packagePath, target);
    const checkPath = target.includes("*")
      ? targetPath.slice(0, targetPath.indexOf("*"))
      : targetPath;
    if (!existsSync(checkPath)) {
      failures.push(`Package export target is missing: ${relative(rootDir, checkPath)}.`);
    }
  }
}

/**
 * Reports missing compiler and build contracts without invoking a second
 * compiler. The CLI enables artifact checks after the aggregate build; tests
 * can validate manifest/configuration behavior in a small fixture.
 */
export function collectParityFailures(rootDir, { requireArtifacts = false } = {}) {
  const failures = [];
  const packageJson = readJson(join(rootDir, "package.json"));
  const scripts = packageJson.scripts ?? {};
  const devDependencies = packageJson.devDependencies ?? {};

  if (scripts.typecheck !== "turbo run typecheck") {
    failures.push("The root typecheck script must remain `turbo run typecheck`.");
  }
  if (!/^7(?:\.|$)/.test(String(devDependencies.typescript ?? ""))) {
    failures.push("The primary TypeScript dependency must be version 7.");
  }
  const resolvedTypeScriptPath = join(rootDir, "node_modules/typescript/package.json");
  if (
    existsSync(resolvedTypeScriptPath) &&
    !/^7(?:\.|$)/.test(String(readJson(resolvedTypeScriptPath).version ?? ""))
  ) {
    failures.push("The installed TypeScript compiler must resolve to version 7.");
  }
  if (!("react-doctor" in devDependencies) || !("oxlint-plugin-react-doctor" in devDependencies)) {
    failures.push("React Doctor and its OxLint plugin must remain installed dependencies.");
  }

  const nativeConfigPath = join(rootDir, "apps/native/tsconfig.json");
  if (existsSync(nativeConfigPath)) {
    const moduleSuffixes = readJsonc(nativeConfigPath).compilerOptions?.moduleSuffixes;
    if (JSON.stringify(moduleSuffixes) !== JSON.stringify([".native", ""])) {
      failures.push("Native TypeScript resolution must prefer `.native` and never `.web`.");
    }
  }

  const dependabotConfigPath = join(rootDir, "infra/dependabot-helper/tsconfig.json");
  if (existsSync(dependabotConfigPath)) {
    const rootDirOption = readJsonc(dependabotConfigPath).compilerOptions?.rootDir;
    if (rootDirOption !== "../..") {
      failures.push("Dependabot Helper must compile with the repository root as its rootDir.");
    }
  }

  const apiConfigPath = join(rootDir, "tsconfig.nest.json");
  if (existsSync(apiConfigPath)) {
    const compilerOptions = readJsonc(apiConfigPath).compilerOptions ?? {};
    if (
      compilerOptions.experimentalDecorators !== true ||
      compilerOptions.emitDecoratorMetadata !== true
    ) {
      failures.push("API decorator transformation and metadata settings must remain enabled.");
    }
  }

  const reactDoctorWorkflowPath = join(rootDir, ".github/workflows/react-doctor.yml");
  if (existsSync(reactDoctorWorkflowPath)) {
    const workflow = readFileSync(reactDoctorWorkflowPath, "utf8");
    if (
      !workflow.includes("millionco/react-doctor@v2") ||
      !workflow.includes("blocking: warning")
    ) {
      failures.push("The locked React Doctor workflow must remain a blocking quality check.");
    }
  }

  const dockerfilePath = join(rootDir, "docker/api/Dockerfile");
  if (existsSync(dockerfilePath)) {
    const dockerfile = readFileSync(dockerfilePath, "utf8");
    if (
      !dockerfile.includes("oven/bun:1.4.0") ||
      !dockerfile.includes("bun install --frozen-lockfile")
    ) {
      failures.push("The Docker API path must use pinned Bun and frozen installation.");
    }
  }

  for (const packagePath of Object.keys(EXPECTED_BUILD_ARTIFACTS)) {
    checkPackageExports(failures, rootDir, packagePath);
    if (requireArtifacts) {
      const sourceMaps = EXPECTED_BUILD_ARTIFACTS[packagePath].filter((artifact) =>
        artifact.endsWith(".map"),
      );
      addMissingFiles(
        failures,
        rootDir,
        EXPECTED_BUILD_ARTIFACTS[packagePath].map((artifact) => join(packagePath, artifact)),
      );
      checkSourceMaps(
        failures,
        rootDir,
        sourceMaps.map((artifact) => join(packagePath, artifact)),
      );
    }
  }

  return failures;
}

if (import.meta.main) {
  const failures = collectParityFailures(findMonorepoRoot(), { requireArtifacts: true });
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`::error::${failure}`);
    }
    process.exit(1);
  }

  console.log("TypeScript parity gate passed.");
}
