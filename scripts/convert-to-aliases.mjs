/**
 * Converts deep relative imports (../../) to @/ path aliases in apps/* source directories.
 * Keeps single-level (../) imports as-is since those are natural directory navigation.
 * Does NOT touch packages/* (aliases are apps-only per project convention).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.normalize(path.resolve(__dirname, ".."));

function getAllTsFiles(dir) {
  const normalizedDir = path.normalize(path.resolve(dir));
  if (!normalizedDir.startsWith(repoRoot)) {
    throw new Error(`Directory ${normalizedDir} is outside repoRoot ${repoRoot}`);
  }
  const files = [];
  for (const item of fs.readdirSync(normalizedDir)) {
    // nosemgrep: gitlab.eslint.detect-non-literal-fs-filename
    const full = path.normalize(path.join(normalizedDir, item));
    if (!full.startsWith(normalizedDir)) {
      throw new Error(`Path traversal detected: ${full} is outside ${normalizedDir}`);
    }
    if (fs.statSync(full).isDirectory()) {
      // nosemgrep: gitlab.eslint.detect-non-literal-fs-filename
      files.push(...getAllTsFiles(full));
    } else if (/\.(ts|tsx)$/.test(item)) {
      files.push(full);
    }
  }
  return files;
}

function convertSrcDir(srcRoot) {
  const normalizedSrcRoot = path.normalize(path.resolve(srcRoot));
  if (!normalizedSrcRoot.startsWith(repoRoot)) {
    throw new Error(`Source root ${normalizedSrcRoot} is outside repoRoot ${repoRoot}`);
  }
  const files = getAllTsFiles(normalizedSrcRoot);
  let changed = 0;

  for (const filePath of files) {
    const normalizedFilePath = path.normalize(path.resolve(filePath));
    if (!normalizedFilePath.startsWith(normalizedSrcRoot)) {
      throw new Error(
        `File path ${normalizedFilePath} is outside source root ${normalizedSrcRoot}`,
      );
    }
    const fileDir = path.normalize(path.dirname(normalizedFilePath));
    const original = fs.readFileSync(normalizedFilePath, "utf8"); // nosemgrep: gitlab.eslint.detect-non-literal-fs-filename

    const updated = original.replace(/from\s+(['"])(\.\.[^'"]+)\1/g, (match, quote, importPath) => {
      // Only convert paths with 2+ levels up
      const levels = (importPath.match(/\.\.\//g) ?? []).length;
      if (levels < 2) return match;

      const resolved = path.normalize(path.resolve(fileDir, importPath));
      if (!resolved.startsWith(repoRoot)) {
        throw new Error(`Import path resolved outside repoRoot: ${resolved}`);
      }
      const rel = path.relative(normalizedSrcRoot, resolved);

      // Don't convert if it escapes src/ (e.g. into node_modules)
      if (rel.startsWith("..")) return match;

      const aliasPath = "@/" + rel.replace(/\\/g, "/");
      return `from ${quote}${aliasPath}${quote}`;
    });

    if (updated !== original) {
      fs.writeFileSync(normalizedFilePath, updated, "utf8"); // nosemgrep: gitlab.eslint.detect-non-literal-fs-filename
      changed++;
      console.log("  " + path.relative(normalizedSrcRoot, normalizedFilePath));
    }
  }
  return changed;
}

const targets = [
  { label: "apps/native/src", src: path.normalize(path.join(repoRoot, "apps/native/src")) },
  { label: "apps/web/src", src: path.normalize(path.join(repoRoot, "apps/web/src")) },
];

for (const { label, src } of targets) {
  const normalizedSrc = path.normalize(path.resolve(src));
  if (!normalizedSrc.startsWith(repoRoot)) {
    throw new Error(`Target path ${normalizedSrc} is outside repoRoot ${repoRoot}`);
  }
  if (!fs.existsSync(normalizedSrc)) {
    // nosemgrep: gitlab.eslint.detect-non-literal-fs-filename
    console.log(`\n[SKIP] ${label} (not found)`);
    continue;
  }
  console.log(`\n=== ${label} ===`);
  const n = convertSrcDir(normalizedSrc);
  console.log(`  → ${n} file(s) updated`);
}
