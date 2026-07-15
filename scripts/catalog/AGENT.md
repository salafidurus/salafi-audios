# AGENT.md - scripts/catalog

Bun dependency catalog manager for the monorepo. Owns `helpers.ts`, `scanner.ts`, `scanner.spec.ts`, `cli.ts`.

## Architecture

Two-directional sync between workspaces and root `package.json` catalogs:

- **`runCatalogFix`** (reality → config): Reads actual workspace dependency versions, updates root catalogs and `catalog.config.json` to match. Creates named groups for version conflicts; canonical (most-used/highest) version goes to default catalog. Only catalogs deps used in 2+ workspaces.
- **`runCatalogFixForce`** (config → reality): Enforces root catalogs + `catalog.config.json` groups onto workspace `package.json` files. First-match-wins for group assignment.
- **`runCatalogCheck`**: Scans all workspaces for misalignment (hardcoded deps that match catalogs, version mismatches, missing catalog entries, duplicate versions across workspaces).

## Rules

- `catalog.config.json` is the single source of truth for group assignments. Do not create alternative config files.
- Groups use glob pattern matching (`*` supported) for both `packages` (dep names) and `workspaces` (relative paths).
- First-match-wins for overlapping groups — order of `groups[]` in config is authoritative.
- `runCatalogFix` never modifies `catalog.config.json` when no config file exists (flat mode).
- `runCatalogFix` preserves existing groups and only adds new ones for version conflicts.
- `runCatalogFixForce` skips workspaces that don't match any group and whose deps are not in default catalog.
- All workspace paths must be normalized to forward slashes (`/`).
- Internal packages (`@sd/*`) and `workspace:` protocol deps are always skipped.

## Testing

- Tests use `bun:test` with mock temp directories. Each test creates and tears down its own monorepo.
- Run: `bun test scripts/catalog/scanner.spec.ts`
- Follow strict TDD when modifying scanner behavior.
