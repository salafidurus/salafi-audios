# AGENT.md — `.agents/`

This directory is the canonical home for shared agent resources in the monorepo.

## Contents

- `rules/` — Always-on behavioral rules. Each file is a named rule set loaded by all agents. Current rules: snip (CLI proxy), codegraph (structural search), ccc (semantic search), headroom (context management), ponytail (code hygiene), agent-dispatch (delegation ladder).
- `skills/` — Canonical shared skills location. All shared skills must be authored here. Tool-specific paths (`.claude/skills/`, `.opencode/skills/`, `.gemini/skills/`) are alias links only — never author skills in those paths.
- `plans/` — Working implementation plans. See `.agents/plans/AGENT.md` for format and lifecycle rules.

## Rules

- Author skills only in `/.agents/skills/<skill-name>/`.
- Run `node scripts/sync-agents.mjs` after any change to this folder — adding a skill, adding or editing a rule file, or modifying any `AGENT.md` inside `.agents/`. The script propagates aliases to tool-specific paths (`.claude/`, `.opencode/`, `.gemini/`). Do not manually recreate alias file contents.
