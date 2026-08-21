# AGENT.md - Salafi Durus Monorepo

This repository is one system. The monorepo is an enforcement tool, not a convenience.

Always-on behavioral rules live in `.agents/rules/`. The project-guardrails skill in `.agents/skills/project-guardrails/` covers non-negotiable architectural rules.

## Repository agent file policy

- `AGENT.md` is the only file that should be authored or edited by agents or humans.
- `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` are compatibility aliases only.
- Never manually create, edit, or delete aliases directly — only edit the sibling `AGENT.md`.
- If an alias is missing/broken, recreate the symlink; do not fork contents.

### Skill location policy

- Canonical shared skills: `/.agents/skills/<skill-name>/`.
- Tool-specific paths (`.opencode/skills/`, `.claude/skills/`, `.gemini/skills/`) are compatibility links — never author there.

### Nested scope policy

- Directory-local `AGENT.md` files refine behavior for that subtree.
- Read order: root `AGENT.md` → nearest local `AGENT.md`.
- Never duplicate instructions across alias files.

### Change discipline

Before editing agent instructions or skills: check you're not touching an alias path. Redirect to canonical paths. Prefer fixing links over editing alias content.

### Alias repair

If alias files or tool-specific folders are missing/broken, run `node scripts/sync-agents.mjs` from repo root. Do not manually rewrite aliases.

## Source of truth

- Architecture and intent: `docs/README.md` then `docs/architecture.md`.
- Read in order: `docs/README.md` → this file → target workspace `AGENT.md`.
- If code and docs conflict, reconcile intentionally.

## Agent skills

### Issue tracker

Issues are tracked in this repository's GitHub Issues through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default Matt Pocock engineering label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Domain documentation uses a multi-context layout with a root `CONTEXT-MAP.md`, system-wide ADRs, and context-local documentation created as needed. See `docs/agents/domain.md`.

## Content nomenclature

See `docs/content/nomenclature.md` for the canonical vocabulary (Collection, Series, Single, Module, Lesson). Do not overload "lecture" or "series".

## Non-negotiable guardrails

See `.agents/skills/project-guardrails/SKILL.md`. Key points: backend authority is absolute, authorization is backend-only, monorepo boundaries are strict (apps→packages✓, app→app✗).

## Commands (root)

- Use `bun run <script>` (not bare `bun <script>`) to go through the defined package script
- Install: `bun install`
- Dev: `bun run dev` (all), `bun run dev:api`, `bun run dev:web`, `bun run dev:native`
- Build: `bun run build`
- Lint: `bun run lint`
- Typecheck: `bun run typecheck`
- Test: `bun run test`
- E2E: `bun run test:e2e`
- Format: `bun run format`

## Scoped execution

- `bun run --filter api <script>` / `bun run --filter web <script>` / `bun run --filter native <script>`
- Packages: `bun run --filter @sd/<package-name> <script>`

## Single-test quick reference

| Workspace    | Command                                                          |
| ------------ | ---------------------------------------------------------------- |
| API          | `bun run --filter api test -- src/modules/.../file.spec.ts`      |
| Web          | `bun run --filter web test src/features/.../file.spec.tsx`       |
| Native       | `bun run --filter native test -- src/features/.../file.spec.tsx` |
| DB           | `bun run --filter @sd/core-db test -- src/file.spec.ts`          |
| E2E          | `bun run --filter web test:e2e -- e2e/file.spec.ts`              |
| By test name | Add `-t "test name"` to any of the above                         |
| Watch        | Use `test:watch` instead of `test`                               |

## Contract and data discipline

- API is a stable contract with explicit intent-driven actions.
- Shared types in `packages/core-contracts` — hand-written, stable.
- All apps import types from `@sd/core-contracts`.
- When API response shapes change, update `packages/core-contracts/src/types/`.

## CI troubleshooting

- Missing `@sd/core-db/client`: build `@sd/core-db` first (generates Prisma client into dist/).
- Missing `@sd/core-contracts`: build contracts package first.
- `@/` path aliases in build output: add `tsc-alias` to the package.
- Web build fails with `NEXT_PUBLIC_API_URL Required`: env parsed at module top-level — make env parsing lazy.

## Documentation standards

- `AGENT.md` = behavior rules for contributors and agents. `README.md` = structure/purpose for humans.
- Update `docs/` when architectural boundaries, API contracts, or offline patterns change.
