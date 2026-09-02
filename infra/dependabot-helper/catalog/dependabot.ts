import { readFileSync, writeFileSync } from "node:fs";

import type { CatalogRepairReport } from "./types";

export const DEPENDABOT_AUDIT_MARKER = "<!-- dependabot-sync:audit -->";

export type DependabotValidation = "passed" | "failed" | "not-run";

export interface DependabotAuditContext {
  validation: DependabotValidation;
  commitSha?: string;
  rejectionReason?: string;
}

export interface DependabotFileValidation {
  allowed: boolean;
  unexpected: string[];
}

function isAllowedFile(filePath: string): boolean {
  return filePath === "bun.lock" || /(^|\/)package\.json$/.test(filePath);
}

export function validateDependabotFiles(filePaths: string[]): DependabotFileValidation {
  const unexpected = filePaths.filter((filePath) => !isAllowedFile(filePath));
  return { allowed: unexpected.length === 0, unexpected };
}

function formatMutation(report: CatalogRepairReport["mutations"][number]): string {
  const policy = report.rule ? `; policy: \`${report.rule}\`` : "";
  return `- \`${report.filePath}\` — ${report.workspace}/${report.dependency}: \`${report.before}\` → \`${report.after}\`${policy}; ${report.reason}`;
}

export function formatDependabotAuditComment(
  report: CatalogRepairReport,
  context: DependabotAuditContext,
): string {
  const mutations =
    report.mutations.length > 0 ? report.mutations.map(formatMutation).join("\n") : "- None";
  const files =
    report.updatedFiles.length > 0
      ? report.updatedFiles.map((file) => `\`${file}\``).join(", ")
      : "None";
  const rejection = context.rejectionReason ? `\n\n**Reason:** ${context.rejectionReason}` : "";
  const commit = context.commitSha ? `\n- Commit: \`${context.commitSha}\`` : "";

  return `${DEPENDABOT_AUDIT_MARKER}
### Dependabot synchronization audit

- Result: **${report.status}**
- Changed files: ${files}
- Bun install --ignore-scripts: ${context.validation}${commit}

#### Mutations

${mutations}${rejection}`;
}

export function hasMatchingAuditComment(comments: string[], expectedComment: string): boolean {
  return comments.some((comment) => comment.trim() === expectedComment.trim());
}

if (import.meta.main) {
  const [, , mode, inputPath, outputPath] = process.argv;

  if (mode === "--validate-files") {
    const files = readFileSync(inputPath!, "utf8").split(/\r?\n/).filter(Boolean);
    const result = validateDependabotFiles(files);
    if (!result.allowed) {
      console.error(`Unexpected Dependabot files: ${result.unexpected.join(", ")}`);
      process.exit(1);
    }
  } else if (mode === "--render") {
    // SAFETY: The workflow writes this JSON from the typed catalog repair report.
    const report = JSON.parse(readFileSync(inputPath!, "utf8")) as CatalogRepairReport;
    const comment = formatDependabotAuditComment(report, {
      // SAFETY: The workflow provides one of the three values declared by this union.
      validation:
        (process.env.DEPENDABOT_VALIDATION as DependabotValidation | undefined) ?? "not-run",
      commitSha: process.env.DEPENDABOT_COMMIT_SHA,
      rejectionReason: process.env.DEPENDABOT_REJECTION_REASON,
    });
    writeFileSync(outputPath!, `${comment}\n`);
  }
}
