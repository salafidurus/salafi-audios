# Salafi Durus agent guidance

This monorepo is one system. Read `docs/README.md`, this file, and the nearest
workspace `AGENT.md` before changing code.

## Agent files and skills

- `AGENT.md` is canonical; `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` are aliases.
- Edit canonical files only. Run `bun run --filter @sd/scripts sync-agents` after changing
  agent resources.
- Shared skills live in `.agents/skills/`; always-on rules live in
  `.agents/rules/`.
- Use `.agents/skills/project-guardrails/` for non-negotiable architecture and
  security rules, and the implementation lifecycle skills for delivery work.

## Source of truth

- Product and architecture: `docs/product/` and `docs/architecture.md`.
- API, client, data, security, administration, and deployment guidance: the
  corresponding files under `docs/`.
- Issues and pull requests: GitHub Issues and PRs, using `docs/agents/`.
- Domain vocabulary: `CONTEXT-MAP.md`, relevant `CONTEXT.md`, and
  `docs/content/nomenclature.md`.

## Non-negotiable boundaries

- The backend is authoritative for business rules, authorization, and state.
- Apps may depend on packages, never directly on other apps.
- Shared API response types belong in `@sd/core-contracts`.
- Update durable architecture or contract documentation when those boundaries
  change.
