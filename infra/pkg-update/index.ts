#!/usr/bin/env bun
import { intro, outro as outroMsg, spinner, note } from "@clack/prompts";
import color from "picocolors";
import { findMonorepoRoot } from "../../scripts/utils/paths.mjs";
import { config } from "./pkg-update.config";
import { checkAll } from "./check";
import { applyUpdate, runVerification } from "./apply";
import { selectUpdates, confirmCommit } from "./utils/ui";
import { isClean, showDiff, commitChanges } from "./utils/git";

async function main(): Promise<void> {
  intro(color.bgCyan(" sd-doctor — pkg-update "));

  const rootDir = findMonorepoRoot();

  if (!isClean()) {
    note(
      "Working tree has uncommitted changes. Commit or stash them first.",
      "\u26A0\uFE0F  Dirty working tree",
    );
    process.exit(1);
  }

  const s = spinner();
  s.start("Checking npm registry\u2026");

  const candidates = await checkAll(rootDir, config);

  s.stop(`Found ${candidates.length} available update(s)`);

  if (candidates.length === 0) {
    outroMsg("Everything is up to date.");
    process.exit(0);
  }

  const selected = await selectUpdates(candidates);
  if (selected.length === 0) {
    outroMsg("No updates selected.");
    process.exit(0);
  }

  s.start("Applying updates\u2026");
  await Promise.all(selected.map((c) => applyUpdate(c, rootDir)));
  s.stop("Updates applied.");

  s.start("Running bun install\u2026");
  const installOutput = await runVerification(rootDir);
  s.stop("bun install complete.");

  const diff = showDiff();
  console.log("\n" + color.dim("\u2500\u2500\u2500 Diff \u2500\u2500\u2500"));
  console.log(diff.slice(0, 2000) + (diff.length > 2000 ? "\n..." : ""));
  console.log(
    color.dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n"),
  );

  const shouldCommit = await confirmCommit();
  if (shouldCommit) {
    const maxLen = 90;
    const prefix = "chore(deps): update ";
    const allNames = selected.map((c) => c.packageName).join(", ");
    let message: string;
    if (`${prefix}${allNames}`.length <= maxLen) {
      message = `${prefix}${allNames}`;
    } else {
      const suffix = `, +${selected.length - 1} more`;
      message = `${prefix}${selected[0]!.packageName}${suffix}`;
    }
    const ok = commitChanges(message);
    if (ok) {
      note(`Committed: ${message}`, "\u2705 Committed");
    } else {
      note("Nothing to commit.", "\u2139\uFE0F");
    }
  }

  outroMsg("Done.");
}

main().catch((err) => {
  console.error(color.red("Error:"), err);
  process.exit(1);
});
