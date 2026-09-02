import { readFile, readdir } from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";

import { protectedPathReason } from "./policy.mjs";

const ignored = new Set([
  ".git",
  ".next",
  "build",
  "coverage",
  "dist",
  "generated",
  "node_modules",
]);
const sourcePattern = /\.(?:[cm]?[jt]sx?|json)$/;

async function walk(root, directory = root) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(root, path)));
    else if (entry.isFile() && sourcePattern.test(entry.name)) files.push(relative(root, path));
  }
  return files;
}

function tokensFor(file) {
  const normalized = file.replaceAll("\\", "/");
  const withoutExtension = normalized.replace(/\.[^.]+$/, "");
  return [...new Set([normalized, withoutExtension, basename(withoutExtension)])].filter(
    (token) => token.length > 2,
  );
}

function packageRoot(file) {
  const parts = file.split("/");
  if (parts[0] === "packages" || parts[0] === "apps" || parts[0] === "infra") {
    return parts.slice(0, 2).join("/");
  }
  return dirname(file) === "." ? "." : null;
}

export async function collectEvidence(auditRoot) {
  const files = await walk(auditRoot);
  const sources = new Map();
  for (const file of files) {
    try {
      sources.set(file, await readFile(resolve(auditRoot, file), "utf8"));
    } catch {
      // A file can disappear between Knip and evidence collection.
    }
  }
  const manifests = [...sources.entries()]
    .filter(([file]) => basename(file) === "package.json")
    .map(([file, source]) => ({ file, source }));
  return { files, sources, manifests };
}

function packageEvidence(file, evidence) {
  const root = packageRoot(file);
  const manifest = evidence.manifests.find(({ file: manifest }) => dirname(manifest) === root);
  if (!manifest) return [];
  let packageJson;
  try {
    packageJson = JSON.parse(manifest.source);
  } catch {
    return [];
  }
  const publicPaths = [packageJson.main, packageJson.module, packageJson.types]
    .filter(Boolean)
    .concat(
      Object.values(packageJson.exports ?? {}).flatMap((value) =>
        value === String(value) ? [value] : Object.values(value ?? {}),
      ),
    );
  return publicPaths.some((entry) => file.endsWith(String(entry).replace(/^\.\//, "")))
    ? [`declared public package surface in ${manifest.file}`]
    : [];
}

function scriptEvidence(file, evidence) {
  return evidence.manifests
    .filter(({ source }) => source.includes(file) || source.includes(`./${file}`))
    .map(({ file: manifest }) => `referenced by package manifest ${manifest}`);
}

export function evidenceForFinding(finding, evidence) {
  const protectedReason = protectedPathReason(finding.file);
  const tokens = tokensFor(finding.file);
  const consumers = [...evidence.sources.entries()]
    .filter(
      ([file, source]) => file !== finding.file && tokens.some((token) => source.includes(token)),
    )
    .slice(0, 12)
    .map(([file]) => file);
  const roots = [
    ...(protectedReason ? [protectedReason] : []),
    ...packageEvidence(finding.file, evidence),
    ...scriptEvidence(finding.file, evidence),
  ];
  const dynamicSignals = [...evidence.sources.entries()]
    .filter(([file, source]) => file !== finding.file && /\b(?:import|require)\s*\(/.test(source))
    .filter(([, source]) => tokens.some((token) => source.includes(token)))
    .slice(0, 12)
    .map(([file]) => file);
  const protectedBy = protectedReason ?? (roots.length > 0 ? roots[0] : null);
  let category = finding.category;
  let confidence = finding.confidence;
  let recommendation = "Review the evidence and verify runtime/build entry points before removal.";
  if (protectedBy) {
    category = protectedReason?.includes("migration") ? "historical" : "protected";
    confidence = "high";
    recommendation = `Preserve unless the ${protectedBy} is intentionally deprecated and separately approved.`;
  } else if (finding.type === "file" && consumers.length === 0 && dynamicSignals.length === 0) {
    category = "confirmed-dead";
    confidence = "high";
    recommendation =
      "Confirm ownership and run affected checks, then remove the exact file if approved.";
  } else if (consumers.length > 0 || dynamicSignals.length > 0) {
    category = "needs-review";
    confidence = "medium";
    recommendation =
      "Inspect the discovered consumers or dynamic loading before changing this code.";
  }
  return {
    ...finding,
    category,
    confidence,
    consumers,
    dynamicSignals,
    evidence: [
      finding.evidence,
      ...roots,
      ...(consumers.length ? [`referenced by ${consumers.length} scanned file(s)`] : []),
    ],
    protectedBy,
    recommendation,
    package: packageRoot(finding.file),
  };
}
