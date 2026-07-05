# Turborepo Guidance

## Critical Rules

### Package Tasks, Not Root Tasks

- Add scripts to each package's `package.json`
- Register tasks in root `turbo.json`
- Root `package.json` only delegates via `turbo run <task>`

### Always Use `turbo run` in Code

```json
// CORRECT in package.json/CI
"build": "turbo run build"

// WRONG - shorthand only for terminal
"build": "turbo build"
```

## Quick Decision Trees

### Configure a Task

- Task dependencies → `dependsOn` in turbo.json
- Build outputs → `outputs: ["dist/**"]`
- Environment variables → `env: ["VAR_NAME"]`
- Dev/watch tasks → `persistent: true`, `cache: false`

### Cache Problems

- Outputs not restored → Missing `outputs` key
- Unexpected misses → Check `env`, `inputs`
- Debug → Use `--summarize` or `--dry`
- Skip cache → `--force` or `cache: false`

### Run Only Changed

```bash
turbo run build --affected
turbo run build --affected --affected-base=origin/develop
```

### Filter Packages

```bash
--filter=web              # By name
--filter=./apps/*         # By directory
--filter=web...           # Package + dependencies
--filter=...web           # Package + dependents
```

## Common Anti-Patterns

### Root Scripts Bypassing Turbo

```json
// WRONG
"build": "bun build"

// CORRECT
"build": "turbo run build"
```

### Manual prebuild Scripts

```json
// WRONG - bypasses dependency graph
"prebuild": "cd ../types && bun build"

// CORRECT - declare dependency, use ^build
"dependencies": { "@repo/types": "workspace:*" }
// turbo.json: "build": { "dependsOn": ["^build"] }
```

### Missing outputs

```json
// WRONG
"build": { "dependsOn": ["^build"] }

// CORRECT
"build": { "dependsOn": ["^build"], "outputs": ["dist/**"] }
```

### ^build vs build

- `^build` = run in DEPENDENCIES first
- `build` = run in SAME PACKAGE first
- `pkg#task` = specific package's task

## Standard Configuration

```json
{
  "$schema": "https://turborepo.dev/schema.v2.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {},
    "typecheck": {},
    "test": { "dependsOn": ["build"] },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Transit Nodes for Parallel Tasks

For tasks that need parallel execution but correct cache invalidation:

```json
{
  "tasks": {
    "transit": { "dependsOn": ["^transit"] },
    "lint": { "dependsOn": ["transit"] },
    "typecheck": { "dependsOn": ["transit"] }
  }
}
```

## Environment Variables

```json
{
  "globalEnv": ["NODE_ENV"],
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "env": ["API_URL"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"]
    }
  }
}
```
