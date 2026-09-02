import { confirm, multiselect, note } from "@clack/prompts";
import color from "picocolors";

import { categorizeBump } from "./semver";

export interface UpdateCandidate {
  type: "catalog" | "bun" | "expo";
  packageName: string;
  currentVersion: string;
  latestVersion: string;
  group?: string;
}

export function formatVersionDiff(current: string, latest: string): string {
  return `${color.dim(current)} ${color.cyan("→")} ${color.green(latest)}`;
}

function bumpLabel(bump: "major" | "minor" | "patch" | null): string {
  if (!bump) return "";
  const colors = { major: color.red, minor: color.yellow, patch: color.blue };
  return colors[bump](bump);
}

export async function selectUpdates(candidates: UpdateCandidate[]): Promise<UpdateCandidate[]> {
  if (candidates.length === 0) {
    note("No updates available.", "Status");
    return [];
  }

  // SAFETY: @clack/prompts returns the selected values or a cancellation symbol.
  const selected = (await multiselect({
    message: "Select updates to apply:",
    options: candidates.map((c) => ({
      value: c,
      label: `${c.packageName.padEnd(20)} ${formatVersionDiff(c.currentVersion, c.latestVersion)} ${bumpLabel(categorizeBump(c.currentVersion, c.latestVersion))}`,
    })),
    required: false,
  })) as UpdateCandidate[] | symbol;

  return Array.isArray(selected) ? selected : [];
}

export async function confirmCommit(): Promise<boolean> {
  const result = await confirm({
    message: "Create commit with these changes?",
  });
  return result === true;
}
