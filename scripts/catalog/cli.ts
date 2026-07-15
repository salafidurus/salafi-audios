import path from "node:path";
import { findMonorepoRoot } from "../utils/paths.mjs";
import {
  runCatalogCheck,
  runCatalogFix,
  getUnusedCatalogEntries,
  runCatalogPrune,
  getWorkspaces,
  parseCatalogs
} from "./scanner";
import fs from "node:fs";

function printHelp() {
  console.log(`
Bun Dependency Catalog Manager

Usage:
  bun catalog [command] [options]

Commands:
  check      Scans workspaces and reports misalignment or duplicates (Default)
  fix        Safely fixes explicit dependency references matching catalog versions.
             Use --force (-f) to forcefully align mismatches to the highest catalog version.
  stats      Shows catalog alignment metrics
  unused     Lists catalog items that are not referenced anywhere
  prune      Removes unused catalog items from the root package.json
  `);
}

async function main() {
  const rootDir = findMonorepoRoot();
  const command = process.argv[2] || "check";

  switch (command) {
    case "check": {
      const { issues, duplicates } = runCatalogCheck(rootDir);
      
      if (issues.length > 0) {
        console.error(`\x1b[31mFound catalog issues:\x1b[0m\n` + issues.map(i => i.details).join("\n"));
        console.log(`\nRun \x1b[32mbun run catalog fix\x1b[0m to resolve exact matches.`);
        process.exit(1);
      }

      if (duplicates.length > 0) {
        console.warn(`\n\x1b[33mSuggestions for cataloging:\x1b[0m`);
        console.warn(`The following dependencies are duplicated but not cataloged:`);
        for (const dup of duplicates) {
          console.warn(`  - '${dup.depName}' is duplicated in: ${dup.workspaces.join(", ")} (versions: ${dup.versions.join(", ")})`);
        }
      }

      console.log("\x1b[32m✓ All dependencies are properly cataloged and aligned!\x1b[0m");
      break;
    }

    case "fix": {
      const force = process.argv.includes("--force") || process.argv.includes("-f");
      const { updatedFiles } = runCatalogFix(rootDir, { force });
      if (updatedFiles.length > 0) {
        console.log(`\x1b[32mSuccessfully aligned catalog references in: ${updatedFiles.join(", ")}\x1b[0m`);
        console.log("Run 'bun install' to regenerate the lockfile.");
      } else {
        console.log(force ? "No catalog references found to forcefully fix." : "No exact version alignments to fix.");
      }
      break;
    }

    case "stats": {
      const rootJson = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));
      const catalogs = parseCatalogs(rootJson);
      const workspaces = getWorkspaces(rootDir);
      const { issues, duplicates } = runCatalogCheck(rootDir);
      const { unusedDefault, unusedNamed } = getUnusedCatalogEntries(rootDir);

      let totalUnused = unusedDefault.length;
      for (const list of Object.values(unusedNamed)) {
        totalUnused += list.length;
      }

      let totalDeps = new Set<string>();
      let defaultRefs = 0;
      let namedRefs = 0;

      const allPackages = [{ name: "root", content: rootJson }, ...workspaces];
      for (const pkg of allPackages) {
        const depTypes = ["dependencies", "devDependencies"] as const;
        for (const depType of depTypes) {
          const deps = pkg.content[depType] || {};
          for (const [name, version] of Object.entries(deps)) {
            if (version.startsWith("workspace:") || name.startsWith("@sd/")) continue;
            totalDeps.add(name);

            if (version === "catalog:") {
              defaultRefs++;
            } else if (version.startsWith("catalog:")) {
              namedRefs++;
            }
          }
        }
      }

      console.log(`\n\x1b[36m=== Monorepo Catalog Stats ===\x1b[0m`);
      console.log(`Workspaces Scanned: ${workspaces.length}`);
      console.log(`Unique Dependencies: ${totalDeps.size}`);
      
      console.log(`\n\x1b[1mCatalog Entries:\x1b[0m`);
      console.log(`  - Default Catalog: ${Object.keys(catalogs.default).length} entries`);
      for (const [groupName, groupDeps] of Object.entries(catalogs.named)) {
        console.log(`  - Named Catalog '${groupName}': ${Object.keys(groupDeps).length} entries`);
      }

      console.log(`\n\x1b[1mReferences:\x1b[0m`);
      console.log(`  - Default Catalog references: ${defaultRefs}`);
      console.log(`  - Named Catalog references: ${namedRefs}`);

      console.log(`\n\x1b[1mHealth status:\x1b[0m`);
      console.log(`  - Unused catalog entries: ${totalUnused}`);
      console.log(`  - Duplicated outside catalog: ${duplicates.length}`);
      console.log(`  - Alignment issues: ${issues.length}`);
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
        console.log("  Default catalog:\n" + unusedDefault.map(d => `    - ${d}`).join("\n"));
      }
      for (const [group, list] of Object.entries(unusedNamed)) {
        if (list.length > 0) {
          console.log(`  Catalog '${group}':\n` + list.map(d => `    - ${d}`).join("\n"));
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

main().catch(err => {
  console.error(err);
  process.exit(1);
});
