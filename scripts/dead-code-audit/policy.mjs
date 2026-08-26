import { createHash } from "node:crypto";

const blockingCategories = new Set(["confirmed-dead"]);

const protectedPathRules = [
  [/^(?:.+\/)?(?:dist|build|coverage|generated)\//, "generated or build output"],
  [/(^|\/)\.next\//, "Next.js build output"],
  [/(^|\/)prisma\/migrations\//, "database migration history"],
  [/(^|\/)src\/app\//, "filesystem route or application entry point"],
  [
    /(^|\/)(?:main|index|layout|middleware|proxy)\.[cm]?[jt]sx?$/,
    "framework or package entry point",
  ],
  [
    /(^|\/)(?:jest|babel|metro|next|expo|oxlint|eslint|tsup)\.config\.[cm]?[jt]s$/,
    "tooling configuration",
  ],
];

export function findingKey(finding) {
  const identity = [
    finding.kind ?? "code",
    finding.type ?? finding.category,
    finding.file,
    finding.name ?? "",
  ]
    .join(":")
    .toLowerCase();
  return createHash("sha256").update(identity).digest("hex").slice(0, 16);
}

export function withFindingKey(finding, kind = "code") {
  return { ...finding, kind, key: finding.key ?? findingKey({ ...finding, kind }) };
}

export function changedFilesFromDiff(diff) {
  return new Set(
    diff
      .split("\n")
      .filter(
        (line) => line.startsWith(" ") === false && /^(?:[AMDRT]\s|[AMDRT][AMDRT]\s)/.test(line),
      )
      .flatMap((line) => {
        const fields = line.trim().split(/\s+/);
        return fields.slice(1).filter((field) => field !== "->");
      }),
  );
}

export function scopeIntroducedFindings(findings, { changedFiles, baselineKeys = new Set() }) {
  return findings.filter(
    (finding) => changedFiles.has(finding.file) && !baselineKeys.has(finding.key),
  );
}

export function blocksPreparation(findings) {
  return findings.filter((finding) => blockingCategories.has(finding.category));
}

export function protectedPathReason(file) {
  return protectedPathRules.find(([pattern]) => pattern.test(file))?.[1] ?? null;
}

export function removableUnit(finding) {
  const protectedReason = protectedPathReason(finding.file);
  if (protectedReason) return null;
  if (finding.kind !== "test" && finding.type !== "file") {
    throw new Error(
      "Removal mode does not support symbol-level removal until a source edit is explicitly provided.",
    );
  }
  return { kind: "file", file: finding.file };
}

export function assertRemovalScope({ ticket, allowlist, findings }) {
  if (!/^\d+$/.test(String(ticket ?? ""))) {
    throw new Error("Removal mode requires an approved cleanup ticket number.");
  }
  if (!Array.isArray(allowlist) || allowlist.length === 0) {
    throw new Error("Removal mode requires an explicit non-empty finding allowlist.");
  }
  if (!Array.isArray(findings) || findings.length === 0) {
    throw new Error("Removal allowlist does not match any current finding.");
  }
  const allowed = new Set(allowlist);
  const outOfScope = findings.filter(
    (finding) => !allowed.has(finding.key) && !allowed.has(finding.file),
  );
  const unconfirmed = findings.filter((finding) => finding.category !== "confirmed-dead");
  if (outOfScope.length > 0) {
    throw new Error(`Removal scope contains ${outOfScope.length} out-of-scope finding(s).`);
  }
  if (unconfirmed.length > 0) {
    throw new Error("Removal mode accepts only confirmed-dead findings.");
  }
}
