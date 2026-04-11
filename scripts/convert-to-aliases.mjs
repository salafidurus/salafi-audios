/**
 * Converts deep relative imports (../../) to @/ path aliases in apps/* source directories.
 * Keeps single-level (../) imports as-is since those are natural directory navigation.
 * Does NOT touch packages/* (aliases are apps-only per project convention).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function getAllTsFiles(dir) {
  const files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      files.push(...getAllTsFiles(full));
    } else if (/\.(ts|tsx)$/.test(item)) {
      files.push(full);
    }
  }
  return files;
}

function convertSrcDir(srcRoot) {
  const files = getAllTsFiles(srcRoot);
  let changed = 0;

  for (const filePath of files) {
    const fileDir = path.dirname(filePath);
    const original = fs.readFileSync(filePath, "utf8");

    const updated = original.replace(
      /from\s+(['"])(\.\.[^'"]+)\1/g,
      (match, quote, importPath) => {
        // Only convert paths with 2+ levels up
        const levels = (importPath.match(/\.\.\//g) ?? []).length;
        if (levels < 2) return match;

        const resolved = path.resolve(fileDir, importPath);
        const rel = path.relative(srcRoot, resolved);

        // Don't convert if it escapes src/ (e.g. into node_modules)
        if (rel.startsWith("..")) return match;

        const aliasPath = "@/" + rel.replace(/\\/g, "/");
        return `from ${quote}${aliasPath}${quote}`;
      }
    );

    if (updated !== original) {
      fs.writeFileSync(filePath, updated, "utf8");
      changed++;
      console.log("  " + path.relative(srcRoot, filePath));
    }
  }
  return changed;
}

const targets = [
  { label: "apps/native/src", src: path.join(repoRoot, "apps/native/src") },
  { label: "apps/web/src", src: path.join(repoRoot, "apps/web/src") },
];

for (const { label, src } of targets) {
  if (!fs.existsSync(src)) {
    console.log(`\n[SKIP] ${label} (not found)`);
    continue;
  }
  console.log(`\n=== ${label} ===`);
  const n = convertSrcDir(src);
  console.log(`  → ${n} file(s) updated`);
}
