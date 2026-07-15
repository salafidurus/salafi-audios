# Metadata

- **Date**: 2026-07-15
- **Status**: Planned
- **Scope**: Rewrite the `scripts/catalog/` tool to implement the group-based config design with clear `fix` vs `fix --force` semantics
- **Summary**: Redesign `catalog.config.json` as an override mechanism where groups route matching dep+workspace combos to named catalogs. `fix` adapts config to reality (auto-creates groups for conflicts). `fix --force` enforces config onto workspaces.
- **Dependencies**: None

# Progress

- Previous agent left `runCatalogFix` not implementing config-based group creation
- A test exists for auto-group-creation behavior but the implementation is missing
- Current `fix --force` has old semantics (highest-version heuristic) that need replacing

# Staging Strategy

Foundational changes first (scanner.ts), then CLI, then tests, then verification.

## Stage 1: Rewrite `runCatalogFix` in `scanner.ts`

- **Status**: Pending
- **Goal**: Implement new `fix` (reality→config) and `fix --force` (config→reality) semantics
- **Files**: `scripts/catalog/scanner.ts`

### Changes

#### New `runCatalogFix` (no `--force`) — reality → config

```
1. Collect all (depName, version, workspacePath) for explicit (non-catalog) deps
2. Group by depName:
   a. All same version → ensure in default catalog, convert all to "catalog:"
   b. Multiple versions:
      - Most-used version → canonical (goes to default catalog)
      - Other versions → create new group in catalog.config.json:
        name: sanitize("dep_version"), packages: [depName], workspaces: [workspacePath]
      - Add to workspaces.catalogs.<group> in root package.json
      - Convert refs: canonical → "catalog:", others → "catalog:<group>"
3. For deps already using "catalog:" or "catalog:<group>":
   - Verify catalog entry exists, report if missing
4. Write root package.json, catalog.config.json, and affected workspace package.json files
```

Group name sanitization: `pg^8.0.0` → `pg_v_8_0_0` (replace non-alphanumeric except `-` and `.` with `_`)

Always re-read files before writing (don't keep stale in-memory state).

#### New `runCatalogFixForce` (with `--force`) — config → reality

```
Phase 1 — Named groups:
  Load catalog.config.json groups
  For each group:
    Get catalog version from root workspaces.catalogs[group.name]
    Find workspaces matching group.workspaces via matchPattern
    For each matching workspace:
      For each dep in group.packages:
        If workspace has dep as explicit version → update to catalog version + "catalog:<group>"
        If workspace has dep as wrong catalog ref → correct it
        If workspace doesn't have dep → skip

Phase 2 — Default catalog:
  For each dep in workspaces.catalog (default):
    If dep+workspace matches any group → skip (handled above)
    For each workspace where dep exists as explicit version:
      Update to default catalog version + "catalog:"
```

### Supporting changes

- Make `loadConfig()` return `{ groups: [] }` not just empty groups when file missing
- Keep `matchPattern()` and `getDependencyGroup()` as-is
- `parseCatalogs()` stays the same
- Add helper `sanitizeGroupName(depName: string, version: string): string`

### Blockers

None currently identified.

### Dependencies

None.

### Completion Criteria

- `bun test --filter catalog` passes
- Auto-group-creation test passes
- Force-enforce test passes
- No regressions in existing test patterns that still apply

### Suggested Commit Message

```
refactor(catalog): implement new fix semantics (reality→config) and --force (config→reality)

Fix without --force adapts the config to match what workspaces actually declare,
auto-creating named groups for version conflicts.
Fix with --force enforces the declared config onto workspaces.
```

---

## Stage 2: Update `runCatalogCheck` for group-aware checking

- **Status**: Pending
- **Goal**: Make `check` use `catalog.config.json` to determine which catalog a dep should use
- **Files**: `scripts/catalog/scanner.ts`

### Changes

Modify `runCatalogCheck`:

- When comparing explicit versions against catalogs, check group membership via `getDependencyGroup()` first
- `"hardcoded"` issue only if the version matches the _correct_ catalog (default or named) for that dep+workspace
- `"missing"` if a dep uses `catalog:<group>` but the group doesn't exist, the dep isn't in the group, or the default catalog entry is missing
- `"mismatch"` if explicit version differs from what the matching catalog entry says

### Blockers

Stage 1 must be complete first (check depends on the new group semantics).

### Dependencies

Depends on Stage 1.

### Completion Criteria

- `bun test --filter catalog` passes
- Check correctly identifies hardcoded/missing/mismatch against the right catalog (default vs named per group membership)
- Duplicate detection still works

### Suggested Commit Message

```
feat(catalog): make check command group-aware via catalog.config.json
```

---

## Stage 3: Update CLI

- **Status**: Pending
- **Goal**: Update `cli.ts` to reflect new semantics, update help text
- **Files**: `scripts/catalog/cli.ts`

### Changes

- Keep all commands (`check`, `fix`, `stats`, `unused`, `prune`)
- Update help text for `fix`:
  - `fix` — "Adapts config to match workspace reality. Creates groups for version conflicts."
  - `fix --force` — "Enforces config onto workspaces. Updates workspace versions to match catalog."
- Wire `fix --force` to `runCatalogFixForce` instead of the old `options.force` codepath
- Wire `fix` (no flag) to new `runCatalogFix`

### Blockers

Stage 1 must be complete.

### Dependencies

Depends on Stage 1.

### Completion Criteria

- `cli.ts` compiles without errors
- `--help` output clearly documents the new semantics

### Suggested Commit Message

```
feat(catalog): update CLI for new fix/force semantics
```

---

## Stage 4: Rewrite test suite

- **Status**: Pending
- **Goal**: All tests match new semantics with full coverage
- **Files**: `scripts/catalog/scanner.spec.ts`

### Changes

Test cases to write:

| Test                                            | Command          | What it verifies                                                                                           |
| ----------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| fix adds to default catalog when single version | `fix`            | Dep used in one workspace at one version → added to default catalog, converted to `catalog:`               |
| fix creates group when version conflict         | `fix`            | Dep used in two workspaces at different versions → most-used stays default, other gets new group in config |
| fix creates group with wildcard patterns        | `fix`            | Config groups with `packages: ["react*"]`, `workspaces: ["apps/*"]` work correctly                         |
| fix preserves existing groups                   | `fix`            | User added group manually → fix populates it, doesn't overwrite                                            |
| fix leaves already-correct refs alone           | `fix`            | Dep already using correct `catalog:` with matching entry → no change                                       |
| fix --force enforces named group                | `fix --force`    | Workspace has explicit version that differs from group's catalog → updated to match                        |
| fix --force enforces default catalog            | `fix --force`    | Workspace has explicit version that differs from default catalog → updated to match                        |
| fix --force skips non-matching workspaces       | `fix --force`    | Group's workspace pattern doesn't match a given workspace → workspace left untouched                       |
| check finds hardcoded with right catalog group  | `check`          | Explicit version matches the _correct_ catalog (default vs named per group) → hardcoded warning            |
| check finds mismatch with right catalog         | `check`          | Explicit version differs from the correct catalog → mismatch issue                                         |
| check finds missing catalog entry               | `check`          | `catalog:foo` but `foo` not in default catalog → missing issue                                             |
| check finds duplicates outside catalog          | `check`          | Same dep, different versions, not cataloged → duplicate suggestion                                         |
| unused/prune with named groups                  | `unused`/`prune` | Named catalog entries not referenced by any workspace → listed/pruned                                      |
| No config file = flat mode                      | `fix`            | No `catalog.config.json` → all deps go to default catalog only                                             |
| Empty groups in config = flat mode              | `fix`            | `{ groups: [] }` → behaves same as no config file                                                          |

Keep/adapt existing tests that still apply:

- `"parses default and named catalogs correctly"` — unchanged
- `"finds and prunes unused catalog dependencies correctly"` — adapt for named groups in config

Remove/supersede:

- `"safely auto-fixes exact matches and ignores mismatches"` — old behavior, superseded by new fix
- `"force-fixes mismatches to the highest catalog version"` — old semantics, replace with new --force test

### Blockers

Stage 1 must be complete.

### Dependencies

Depends on Stages 1–3.

### Completion Criteria

- `bun test --filter catalog` passes with all tests
- 100% coverage of the new fix/force/check/prune semantics

### Suggested Commit Message

```
test(catalog): rewrite test suite for new fix/force/check semantics
```

---

## Stage 5: Run verification across the monorepo

- **Status**: Pending
- **Goal**: No regressions in the wider repo
- **Files**: None (verification only)

### Changes

1. Run `bun test` to confirm no regressions
2. Run `bun run catalog check` on the real monorepo to verify it works against real data
3. Run `bun run catalog fix` to verify it can process the actual workspace deps
4. Run `bun run catalog stats` to confirm stats display works

### Blockers

Stages 1–4 must be complete.

### Dependencies

Depends on Stages 1–4.

### Completion Criteria

- No test regressions
- `bun run catalog check` reports sensible output against real monorepo
- No exceptions thrown

### Suggested Commit Message

```
chore: verify catalog tool against monorepo
```

---

# Final Verification

- `bun test` passes with no regressions
- `bun run catalog check` runs successfully against real monorepo
- `bun run catalog stats` displays correct metrics
- `bun run catalog fix` processes real workspace deps without errors
- Manual inspection of `catalog.config.json` confirms group structure is correct

# Plan Completion

- All 5 stages complete
- `catalog.config.json` auto-generated groups correctly represent the monorepo's dependency structure
- Tests provide confidence in the new semantics
- Plan file archived to `.agents/plans/completed/`
