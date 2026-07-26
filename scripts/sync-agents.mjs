#!/usr/bin/env bun
/**
 * Normalizes the repo's agent resource links.
 *
 * Skills / Plans — directory-level junctions:
 *   .agents/skills → .claude/skills, .opencode/skills, .gemini/skills (and per-app)
 *   .agents/plans  → .claude/plans,  .opencode/plans,  .gemini/plans  (and per-app)
 *   If the target already exists as a real directory, it is left in place (warn only).
 *
 * Rules — per-file symlinks inside existing dirs:
 *   Each .agents/rules/*.md → .claude/rules/<name>, .opencode/rules/<name>, .gemini/rules/<name>
 *   This preserves tool-specific rule files (e.g. .claude/rules/argent.md).
 *
 * AGENT.md aliases — file symlinks next to every AGENT.md:
 *   AGENT.md → AGENTS.md, CLAUDE.md, GEMINI.md (root + all sub-packages)
 *
 * Run from repo root: node scripts/sync-agents.mjs
 */

import {
  existsSync,
  mkdirSync,
  lstatSync,
  unlinkSync,
  symlinkSync,
  readdirSync,
  realpathSync,
  rmdirSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { findMonorepoRoot } from "./utils/paths.mjs";
import { warn, success, setPrefix } from "./utils/logging.mjs";

setPrefix("[SyncAgents]");

const root = findMonorepoRoot();
const AGENTS_DIR = join(root, ".agents");
const SKILLS = join(AGENTS_DIR, "skills");
const PLANS = join(AGENTS_DIR, "plans");
const RULES = join(AGENTS_DIR, "rules");

const TOOLS = [".claude", ".opencode", ".gemini"];
const SKIP_DIRS = new Set(["node_modules", ".git", ".turbo", "dist", "build", ".next", "scripts"]);

// ── helpers ────────────────────────────────────────────────────────────────

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

function isJunction(p) {
  // realpathSync.native resolves through junctions on Windows; real dirs return themselves
  try {
    const real = realpathSync.native(p);
    return real.toLowerCase() !== resolve(p).toLowerCase();
  } catch {
    return false;
  }
}

/** Remove a path only if it is a symlink or junction. Real dirs/files: warn + return false. */
function removeLink(p) {
  if (!existsSync(p)) return true;
  const stat = lstatSync(p);
  if (stat.isSymbolicLink()) {
    unlinkSync(p);
    return true;
  }
  if (stat.isDirectory()) {
    if (!isJunction(p)) {
      warn(`  skip (real dir): ${p}`);
      return false;
    }
    // Junction — Native rmdirSync deletes the directory junction itself on Windows without touching the target folder contents
    rmdirSync(p);
    return true;
  }
  // Real file — safe to overwrite alias shims (AGENTS.md, CLAUDE.md etc. are tiny path files)
  unlinkSync(p);
  return true;
}

function linkFile(link, target) {
  if (!removeLink(link)) return;
  try {
    symlinkSync(target, link, "file");
  } catch (err) {
    warn(`  warn (file link): ${link} — ${err.message}`);
  }
}

function linkDir(link, target) {
  if (!removeLink(link)) return;
  try {
    symlinkSync(target, link, "dir");
  } catch {
    symlinkSync(target, link, "junction");
  } // junction fallback (no admin needed)
}

// ── bootstrap ──────────────────────────────────────────────────────────────

ensureDir(SKILLS);
ensureDir(PLANS);
ensureDir(RULES);

// Root AGENT.md aliases
for (const alias of ["AGENTS.md", "CLAUDE.md", "GEMINI.md"]) {
  linkFile(join(root, alias), join(root, "AGENT.md"));
}

// Skills + plans — directory junctions per tool (root level)
for (const tool of TOOLS) {
  ensureDir(join(root, tool));
  linkDir(join(root, tool, "skills"), SKILLS);
  linkDir(join(root, tool, "plans"), PLANS);
}

// Rules — directory junctions (same pattern as skills/plans)
for (const tool of TOOLS) {
  ensureDir(join(root, tool));
  linkDir(join(root, tool, "rules"), RULES);
}

// Local .agents/ dirs — for each immediate subdirectory that has its own .agents/
// folder, create tool symlinks pointing to that local .agents/.
// Also removes stale tool dirs from subdirectories that don't have .agents/.
function syncLocalAgentTools(rootDir) {
  let entries;
  try {
    entries = readdirSync(rootDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
    if (!entry.isDirectory()) continue;
    const subDir = join(rootDir, entry.name);
    const agentsDir = join(subDir, ".agents");
    if (existsSync(agentsDir)) {
      // Has local .agents/ — create tool symlinks
      for (const tool of TOOLS) {
        const toolDir = join(subDir, tool);
        ensureDir(toolDir);
        linkDir(join(toolDir, "skills"), join(agentsDir, "skills"));
        linkDir(join(toolDir, "plans"), join(agentsDir, "plans"));
        linkDir(join(toolDir, "rules"), join(agentsDir, "rules"));
      }
    } else {
      // No local .agents/ — remove any stale tool dirs
      for (const tool of TOOLS) {
        for (const sub of ["skills", "plans", "rules"]) {
          const link = join(subDir, tool, sub);
          if (existsSync(link)) removeLink(link);
        }
        const toolDir = join(subDir, tool);
        if (existsSync(toolDir) && lstatSync(toolDir).isDirectory()) {
          try {
            rmdirSync(toolDir);
          } catch {}
        }
      }
    }
    // Recurse into subdirectory to handle nested dirs (e.g. apps/api/)
    syncLocalAgentTools(subDir);
  }
}
syncLocalAgentTools(root);

// AGENT.md aliases — walk tree, create AGENTS.md / CLAUDE.md / GEMINI.md next to each
function syncAliases(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      syncAliases(full);
      continue;
    }
    if (entry.name === "AGENT.md") {
      for (const alias of ["AGENTS.md", "CLAUDE.md", "GEMINI.md"]) {
        linkFile(join(dir, alias), full);
      }
    }
  }
}

syncAliases(root);

success("Repo normalized successfully.");
