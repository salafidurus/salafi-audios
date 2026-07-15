# Catalog Dependency Manager

Manages Bun's workspace `catalog:` protocol for this monorepo. Synchronizes dependency versions between workspace `package.json` files and root-level catalog entries.

## Usage

```bash
bun catalog [command]
```

### Commands

| Command       | Description                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `check`       | Scans workspaces and reports misalignment or duplicates (default command) |
| `fix`         | Adapts catalogs to match actual workspace dependency versions             |
| `fix --force` | Enforces catalog config onto workspace dependency versions                |
| `stats`       | Shows catalog alignment metrics                                           |
| `unused`      | Lists catalog entries that are not referenced anywhere                    |
| `prune`       | Removes unused catalog entries from the root `package.json`               |

### `check` (default)

Scans every workspace and root `package.json` for:

- **Hardcoded deps** — dependency versions that match a catalog entry but are written as explicit versions instead of `catalog:` references
- **Version mismatches** — explicit versions that differ from their matching catalog entry
- **Missing catalog entries** — `catalog:` references that point to nonexistent entries
- **Duplicates** — the same dependency at different versions across workspaces, not yet cataloged

Exits with code 1 if any alignment issues are found.

### `fix`

Reads actual workspace dependency versions and updates root catalogs and `catalog.config.json` to match:

1. Dependencies already matching a `catalog.config.json` group get added to that group's named catalog entry
2. Dependencies not matching any group but consistent across workspaces get added to the default catalog
3. Dependencies with version conflicts create a new named group; the most-used (or highest semver) version stays in the default catalog
4. If no `catalog.config.json` exists, operates in flat mode (no config file is created)

Does not modify workspace `package.json` files — only updates root catalogs and config.

```bash
bun run catalog fix
```

### `fix --force`

The reverse of `fix`: reads root catalogs and `catalog.config.json` groups and enforces them onto workspace `package.json` files. Every dependency matching a group is rewritten to use `catalog:<group>`; everything else in the default catalog uses `catalog:`.

```bash
bun run catalog fix --force
```

### `stats`

Prints a summary of catalog health: total workspaces, catalog entries (default + named), reference counts, unused entries, and alignment issues.

### `unused`

Lists catalog entries in the root `package.json` that are not referenced by any workspace or the root itself.

### `prune`

Removes unused catalog entries from the root `package.json`.

## How groups work

`catalog.config.json` defines named groups that route specific dependency+workspace combos to named catalogs:

```json
{
  "groups": [
    {
      "name": "react_native",
      "packages": ["react", "react-dom"],
      "workspaces": ["apps/native", "packages/core-*"]
    }
  ]
}
```

- `packages`: dep name patterns (can use `*` globs)
- `workspaces`: workspace relative path patterns (can use `*` globs)
- First-match-wins: if a dependency in a workspace matches multiple groups, the first matching group in the array is used
- Dependencies that don't match any group use the default catalog (`catalog:`)
- The version in the named catalog entry is the version actually used by matching workspaces

## Architecture

Two-directional sync model:

```text
catalog fix:        Workspace reality → catalog.config + root catalog entries
catalog fix --force: catalog.config + root catalog entries → Workspace reality
catalog check:      Workspace reality vs catalog entries → diff report
```

Only dependencies used in **2+ workspaces** are eligible for cataloging. Single-workspace deps are left as explicit versions.

## File structure

| File                  | Purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| **`helpers.ts`**      | Types, parsers, pattern matching, group resolution            |
| **`scanner.ts`**      | Operations: check, fix, fix-force, unused, prune, stats       |
| **`cli.ts`**          | Thin CLI entrypoint — calls scanner functions, formats output |
| **`scanner.spec.ts`** | 28 tests covering all paths                                   |
