import { findMonorepoRoot } from "../utils/paths.mjs";
import {
  runCatalogCheck,
  runCatalogFix,
  runCatalogFixForce,
  getUnusedCatalogEntries,
  runCatalogPrune,
  runCatalogStats,
} from "./scanner";

function printHelp() {
  console.log(`
Bun Dependency Catalog Manager

Usage:
  bun catalog [command] [options]

Commands:
  check      Scans workspaces and reports misalignment or duplicates (Default)
  fix        Adapts catalogs to reality: adds new catalog entries and creates
             named groups for version conflicts. Use --force (-f) to enforce
             the config onto workspaces instead.
  stats      Shows catalog alignment metrics
  unused     Lists catalog items that are not referenced anywhere
  prune      Removes unused catalog items from the root package.json
  `);
}

function main() {
  const rootDir = findMonorepoRoot();
  const command = process.argv[2] || "check";

  switch (command) {
    case "check": {
      const { issues, duplicates } = runCatalogCheck(rootDir);

      if (issues.length > 0) {
        console.error(
          `\x1b[31mFound catalog issues:\x1b[0m\n` + issues.map((i) => i.details).join("\n"),
        );
        console.log(`\nRun \x1b[32mbun run catalog fix\x1b[0m to adapt catalogs to reality.`);
        process.exit(1);
      }

      if (duplicates.length > 0) {
        console.warn(`\n\x1b[33mSuggestions for cataloging:\x1b[0m`);
        console.warn(`The following dependencies are duplicated but not cataloged:`);
        for (const dup of duplicates) {
          console.warn(
            `  - '${dup.depName}' is duplicated in: ${dup.workspaces.join(", ")} (versions: ${dup.versions.join(", ")})`,
          );
        }
      }

      console.log("\x1b[32m✓ All dependencies are properly cataloged and aligned!\x1b[0m");
      break;
    }

    case "fix": {
      const force = process.argv.includes("--force") || process.argv.includes("-f");
      const { updatedFiles } = force ? runCatalogFixForce(rootDir) : runCatalogFix(rootDir);
      if (updatedFiles.length > 0) {
        console.log(
          `\x1b[32mSuccessfully aligned catalog references in: ${updatedFiles.join(", ")}\x1b[0m`,
        );
        console.log("Run 'bun install' to regenerate the lockfile.");
      } else {
        console.log("\x1b[32mAll catalog references are already aligned.\x1b[0m");
      }
      break;
    }

    case "stats": {
      const stats = runCatalogStats(rootDir);
      const s = stats;

      console.log(`\n\x1b[36m=== Monorepo Catalog Stats ===\x1b[0m`);

      console.log(`\n\x1b[1mOverview:\x1b[0m`);
      console.log(`  Workspaces:      ${s.overview.totalWorkspaces}`);
      console.log(`  Unique deps:     ${s.overview.uniqueExternalDeps}`);
      console.log(
        `  Catalogued:      ${s.overview.correctlyCataloged}/${s.overview.eligibleDeps + s.overview.miscatalogued}`,
      );
      console.log(`  Miscatalogued:   ${s.overview.miscatalogued}`);
      console.log(`  Score:           ${s.overview.coveragePercent}%`);

      console.log(`\n\x1b[1mCatalog Entries:\x1b[0m`);
      console.log(`  Default catalog: ${s.entries.default} entries`);
      for (const g of s.entries.named) {
        console.log(`  Named '${g.name}': ${g.entries} entries`);
      }
      console.log(`  Total:           ${s.entries.total} entries`);

      console.log(`\n\x1b[1mPer-Workspace:\x1b[0m`);
      for (const ws of s.perWorkspace) {
        const bar = ws.percent >= 80 ? "\x1b[32m" : ws.percent >= 50 ? "\x1b[33m" : "\x1b[31m";
        console.log(
          `  ${bar}${ws.relativePath.padEnd(24)} ${String(ws.catalogedEligible).padStart(2)}/${String(ws.totalDeps).padStart(2)} (${String(ws.percent).padStart(2)}%)\x1b[0m`,
        );
      }

      if (s.candidates.length > 0) {
        console.log(`\n\x1b[33mCatalog Candidates (${s.candidates.length}):\x1b[0m`);
        for (const c of s.candidates) {
          const parts = c.groups.map((g) => `${g.version} (${g.workspaces.join(", ")})`);
          console.log(`  - ${c.depName.padEnd(25)} ${parts.join(", ")}`);
        }
      }

      console.log(`\n\x1b[1mHealth:\x1b[0m`);
      console.log(`  Unused entries:  ${s.unused.total}`);
      console.log(`  Duplicates:      ${s.alignment.duplicates}`);
      console.log(`  Issues:          ${s.alignment.issues}`);
      break;
    }

    case "unused": {
      const { unusedDefault, unusedNamed } = getUnusedCatalogEntries(rootDir);
      let total = unusedDefault.length;
      for (const list of Object.values(unusedNamed)) total += list.length;

      if (total === 0) {
        console.log("\x1b[32m✓ No unused catalog dependencies.\x1b[0m");
        return;
      }

      console.log("\x1b[33mUnused catalog dependencies:\x1b[0m");
      if (unusedDefault.length > 0) {
        console.log("  Default catalog:\n" + unusedDefault.map((d) => `    - ${d}`).join("\n"));
      }
      for (const [group, list] of Object.entries(unusedNamed)) {
        if (list.length > 0) {
          console.log(`  Catalog '${group}':\n` + list.map((d) => `    - ${d}`).join("\n"));
        }
      }
      console.log(`\nRun \x1b[32mbun run catalog prune\x1b[0m to remove them.`);
      break;
    }

    case "prune": {
      const { prunedCount } = runCatalogPrune(rootDir);
      if (prunedCount > 0) {
        console.log(`\x1b[32m✓ Pruned ${prunedCount} unused dependencies from catalog.\x1b[0m`);
      } else {
        console.log("\x1b[32m✓ Nothing to prune.\x1b[0m");
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main();
