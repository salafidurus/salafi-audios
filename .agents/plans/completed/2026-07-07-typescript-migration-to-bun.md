# TypeScript Configuration Migration to Bun Recommended Setup

**Objective**: Migrate all TypeScript configurations across the monorepo to align with Bun's recommended setup while enhancing compiler options for better type safety and developer experience.

---

## Current State

The repository has a dual-preset architecture:

- **tsconfig.base.json** - Shared base for all workspaces
- **tsconfig.nest.json** - Backend/NestJS preset (CommonJS, node resolution)
- **tsconfig.packages.json** - Bundler preset (preserve modules, bundler resolution)

Apps and packages extend these with:

- Separate `tsconfig.json` (typecheck-only) and `tsconfig.build.json` (emit configs)
- Platform-specific settings (decorators for NestJS, JSX modes, module suffixes for native)

---

## Target State: Bun Recommended Configuration

Based on [Bun's TypeScript Guide](https://bun.com/docs/guides/runtime/typescript), the migration will:

### 1. **Base Configuration (tsconfig.base.json)** - Updated

**Key Changes:**

- `"lib": ["ESNext"]` (from `["ES2024", "DOM"]`) — Bun prefers ESNext
- `"target": "ESNext"` (from `"ES2023"`) — Bun optimizes for latest features
- `"module": "Preserve"` (NEW at base level) — Let bundlers/runtimes handle modules
- `"moduleDetection": "force"` (KEEP) — Treat every file as module
- `"jsx": "react-jsx"` (NEW at base) — Modern JSX transform (can override per-app)
- `"moduleResolution": "bundler"` (CHANGE from missing) — Bun's preferred resolution
- `"allowImportingTsExtensions": true` (NEW) — Bun supports TS extension imports
- `"verbatimModuleSyntax": true` (KEEP) — Already strict
- `"noEmit": true` (NEW at base) — Default to typecheck-only; build configs override

**Keep from current setup:**

- `"strict": true`
- `"skipLibCheck": true`
- `"noUncheckedIndexedAccess": true`
- `"noUnusedLocals": false` (off by default; projects can enable)
- `"noUnusedParameters": false` (off by default; projects can enable)

**Enhanced additions:**

- `"isolatedModules": true` — Ensure each file can be transpiled independently
- `"forceConsistentCasingInFileNames": true` (KEEP, already present)
- `"resolveJsonModule": true` (KEEP, already present)
- `"allowSyntheticDefaultImports": true` — Better CommonJS interop for NestJS
- `"esModuleInterop": true` (CONDITIONAL - only in NestJS preset)
- `"declaration": true` (CONDITIONAL - only in build configs for libs)
- `"declarationMap": true` (CONDITIONAL - only in build configs for libs)
- `"sourceMap": true` (NEW - for debugging, optional in build configs)

---

### 2. **Backend Preset (tsconfig.nest.json)** - Modernized for Bun

**Key Changes:**

- Keep `"module": "CommonJS"` (NestJS CLI expects CommonJS output)
- Keep `"experimentalDecorators": true` (NestJS requirement)
- Keep `"emitDecoratorMetadata": true` (NestJS requirement)
- `"moduleResolution": "bundler"` (CHANGE from `"node"` — Bun compatibility)
- Keep `"verbatimModuleSyntax": false` (must stay false for decorator metadata)
- `"resolveJsonModule": true` (KEEP)
- `"skipLibCheck": true` (KEEP)
- `"esModuleInterop": true` (KEEP for CommonJS interop)

**Removed duplicates** (inherit from base):

- Remove settings already in base (lib, target, moduleDetection, strict, etc.)

---

### 3. **Bundler Preset (tsconfig.packages.json)** - Aligned with Bun

**Key Changes:**

- Keep `"module": "Preserve"` (inherit from base now)
- Keep `"moduleResolution": "bundler"` (inherit from base now)
- Keep `"isolatedModules": true`
- `"noEmit": true` (CHANGE - inherit from base, but build configs override)
- Keep all esModuleInterop settings for React Native/Expo compatibility
- `"types": ["vitest/globals", "node"]` → Add `"bun"` to types array

**Removed duplicates** (inherit from base):

- moduleDetection, jsx, allowImportingTsExtensions, verbatimModuleSyntax

---

### 4. **App-Specific Configurations**

#### **apps/api/tsconfig.json** (NestJS - no build needed, use CLI)

```json
{
  "extends": "../tsconfig.nest.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["vitest/globals", "node", "bun"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

**Note:** Remove `tsconfig.build.json` — NestJS CLI has own emit logic.

#### **apps/web/tsconfig.json** (Next.js)

```json
{
  "extends": "../tsconfig.packages.json",
  "compilerOptions": {
    "jsx": "preserve", // Override: Next.js uses SWC
    "noEmit": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "src/**/*"],
  "exclude": ["node_modules", ".next"]
}
```

**Note:** Keep single config; Next.js doesn't use separate build tsconfig.

#### **apps/native/tsconfig.json** (Expo)

```json
{
  "extends": ["expo/tsconfig.base", "../tsconfig.packages.json"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

### 5. **Package Configurations** (core-api, core-db, core-contracts, design-tokens)

#### **packages/{name}/tsconfig.json** (Editor/typecheck)

```json
{
  "extends": "../tsconfig.packages.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["vitest/globals", "node", "bun"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

#### **packages/{name}/tsconfig.build.json** (Build/emit)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "emitDecorationMetadata": false
  },
  "include": ["src/**/*"],
  "exclude": ["src/**/*.spec.ts", "src/**/*.test.ts"]
}
```

---

## Migration Steps

### Phase 1: Update Base Configuration

1. **Update `tsconfig.base.json`**
   - Change `lib`, `target`, `module`, `moduleResolution`
   - Add `allowImportingTsExtensions`, `isolatedModules`, `noEmit`, `jsx`
   - Verify no conflicts with downstream configs

2. **Verify inheritance chain**
   - Ensure all packages/apps still extend correctly
   - Run TypeScript compiler on each to check for errors

### Phase 2: Update Backend Preset

1. **Update `tsconfig.nest.json`**
   - Change `moduleResolution` from `node` to `bundler`
   - Remove duplicated settings (inherit from base)
   - Test NestJS CLI build: `bun run build:api`

2. **Simplify `apps/api/tsconfig.json`**
   - Remove redundant settings
   - Keep only app-specific overrides

### Phase 3: Update Bundler Preset

1. **Update `tsconfig.packages.json`**
   - Remove duplicated settings (now in base)
   - Add `bun` to types array
   - Test with: `bun run typecheck` (if script exists)

### Phase 4: Update App Configs

1. **Simplify each app's tsconfig.json**
   - Remove duplicates from presets
   - Keep only app-specific overrides (jsx, paths, etc.)
   - Verify with IDE and `tsc --noEmit`

2. **Update package tsconfig files**
   - Simplify editor configs (inherit more from base/presets)
   - Ensure build configs are correct

### Phase 5: Code Refactoring for Stricter Type Safety

1. **Enable stricter options in build configs**
   - Add `noUnusedLocals`, `noUnusedParameters`, `noPropertyAccessFromIndexSignature` to tsconfig.build.json for all packages
   - Identify violations: `tsc --noEmit` shows unused imports, variables, parameters

2. **Systematic refactoring by package**
   - **packages/core-api**: Remove unused exports, fix index access types
   - **packages/core-db**: Clean up Prisma-generated code usage
   - **packages/core-contracts**: Fix type definitions with stricter rules
   - **packages/design-tokens**: Simplify unused token exports
   - **apps/api**: Remove unused NestJS decorators, services
   - **apps/web**: Clean Next.js pages and components
   - **apps/native**: Fix Expo component unused props

3. **Create project references**
   - Create root `tsconfig.json` with all project references
   - Enable `composite: true` and `incremental: true` in each package/app
   - Test incremental builds: `tsc -b --clean && tsc -b`

4. **Expected outcomes**
   - ~50-200 lines removed per app (unused code)
   - Better source map support for debugging
   - Faster type-checking with project references
   - Stricter type safety prevents runtime errors

### Phase 6: Testing & Verification

1. **Type-check all workspaces**
   - Run `tsc -b` (uses project references)
   - Run `bun run typecheck` or `tsc --noEmit` in each app/package
   - Fix any new strict errors from stricter compiler options

2. **Build each package/app**
   - `bun run build:api` (NestJS backend) — verify `.js` + `.map` files
   - `bun run build:web` (Next.js frontend)
   - `bun run build:native` (Expo)
   - `bun run build` for all packages/apps — verify `.d.ts` + `.d.ts.map` files

3. **Verify source maps**
   - Check that `.map` files are generated alongside JS/declaration files
   - Test debugger with source map: navigate to breakpoint in TS file

4. **Run test suite**
   - `bun run test` (across all workspaces)
   - Verify no typecheck failures
   - Check test duration (should be slightly faster with incremental compilation)

5. **Run IDE diagnostics**
   - Verify no new TypeScript errors in VS Code
   - Check that language services respond correctly
   - Verify IDE can jump-to-definition across packages

---

## Files to Modify

### Priority 1 (Core Infrastructure)

- `tsconfig.json` - **CREATE NEW** (root project references)
- `tsconfig.base.json` - Update base configuration (add `types`, `jsx`, `module`, etc.)
- `tsconfig.nest.json` - Backend preset (update `moduleResolution`, remove duplicates)
- `tsconfig.packages.json` - Bundler preset (remove duplicates, add `bun` to types)

### Priority 2 (Apps)

- `apps/api/tsconfig.json` - Simplify (add `composite: true`)
- `apps/api/tsconfig.build.json` - Update (add source maps, stricter options, remove)
- `apps/web/tsconfig.json` - Simplify (add `composite: true`)
- `apps/native/tsconfig.json` - Simplify (add `composite: true`)

### Priority 3 (Packages)

- `packages/core-api/tsconfig.json` - Simplify (add `composite: true`)
- `packages/core-api/tsconfig.build.json` - Update (add source maps, stricter options)
- `packages/core-db/tsconfig.json` - Simplify (add `composite: true`)
- `packages/core-db/tsconfig.build.json` - Update (add source maps, stricter options)
- `packages/core-contracts/tsconfig.json` - Simplify (add `composite: true`)
- `packages/core-contracts/tsconfig.build.json` - Update (add source maps, stricter options)
- `packages/design-tokens/tsconfig.json` - Simplify (add `composite: true`)
- `packages/design-tokens/tsconfig.build.json` - Update (add source maps, stricter options)

### Code Refactoring (Phase 5)

- All app source files (`apps/*/src/**/*.ts(x)`)
- All package source files (`packages/*/src/**/*.ts(x)`)
- Expected changes: Remove ~50-200 lines per app of unused code

---

## Enhancements Beyond Bun Recommendations (Integrated)

### 1. **Stricter Type Safety (Core Part of Migration)**

Add to all configs (especially critical for packages and libraries):

```json
"noUnusedLocals": true,
"noUnusedParameters": true,
"noPropertyAccessFromIndexSignature": true
```

**Rollout strategy:**

- **Phase 1 baseline**: Enable in all new build configs
- **Phase 2 opt-in**: Apps can gradually enable based on team readiness
- **Phase 3 audit**: Code refactoring pass to fix any violations (expected impact: ~50-200 lines per app)

**Expected refactoring needs:**

- Remove unused imports and variables
- Add type annotations for indexed access (e.g., `obj[key as keyof typeof obj]`)
- Fix unused function parameters (rename to `_param` if intentionally unused)
- Estimate: 1-2 hours per app for initial cleanup

### 2. **Source Maps for Debugging (Enabled by Default in Build)**

Add to all build configs:

```json
"sourceMap": true,
"declarationMap": true,
"inlineSourceMap": false,
"inlineSources": false
```

**Benefits:**

- Debug TypeScript code directly in browser/runtime
- Link stack traces back to source
- Included in distribution for production debugging
- Minimal size impact (separate `.map` files)

### 3. **Bun-Specific Types (In All Configs)**

Add `"bun"` to types array:

**In tsconfig.base.json:**

```json
"types": ["bun", "node"]
```

**In app/package configs:**

```json
"types": ["bun", "vitest/globals", "node"]
```

### 4. **Better Error Messages (TypeScript 5.3+)**

Already enabled by:

- `"strict": true`
- `"noUncheckedIndexedAccess": true`
- `"noImplicitOverride": true` (NEW: add to base)
- `"noImplicitReturns": true` (included in strict mode)

### 5. **Project References (Incremental Builds)**

Create root `tsconfig.json` with project references for better incremental compilation:

**New `tsconfig.json` at repo root:**

```json
{
  "files": [],
  "references": [
    { "path": "./packages/core-api" },
    { "path": "./packages/core-db" },
    { "path": "./packages/core-contracts" },
    { "path": "./packages/design-tokens" },
    { "path": "./apps/api" },
    { "path": "./apps/web" },
    { "path": "./apps/native" }
  ],
  "compilerOptions": {
    "composite": true
  }
}
```

**In each referenced package/app tsconfig.json:**

```json
{
  "compilerOptions": {
    "composite": true,
    "incremental": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Benefits:**

- Bun runs `tsc` significantly faster with project references
- Only affected packages are type-checked
- Better IDE performance (watches only changed files)
- Proper dependency resolution order

---

## Verification Checklist

### Configuration Phase

- [ ] Root `tsconfig.json` created with project references
- [ ] `tsconfig.base.json` updated with Bun settings (lib, target, module, jsx)
- [ ] `tsconfig.nest.json` updated (moduleResolution: bundler)
- [ ] `tsconfig.packages.json` updated (remove duplicates, add bun types)
- [ ] All app tsconfig.json files simplified and use `composite: true`
- [ ] All package tsconfig.json files simplified and use `composite: true`
- [ ] All build configs updated with source maps and stricter options

### Code Refactoring Phase

- [ ] Stricter type options enabled: `noUnusedLocals`, `noUnusedParameters`, `noPropertyAccessFromIndexSignature`
- [ ] All packages/apps refactored to pass stricter type checking
- [ ] Unused imports removed from all files
- [ ] Unused variables/parameters renamed to `_` or removed
- [ ] Index access types properly annotated (`.as keyof typeof obj`)

### Build & Test Phase

- [ ] `tsc -b` runs successfully with project references
- [ ] `bun run build:api` produces `.js` and `.map` files
- [ ] `bun run build:web` completes without errors
- [ ] `bun run build:native` completes without errors
- [ ] All packages emit `.d.ts` and `.d.ts.map` files
- [ ] `.map` files are correctly generated in dist directories
- [ ] Test suite passes (`bun run test`)
- [ ] No new type errors in any workspace

### IDE & Debugging Phase

- [ ] VS Code shows no type errors (F1 → Run Linters)
- [ ] Jump-to-definition works across packages
- [ ] Debugger can navigate TypeScript source using source maps
- [ ] Source maps are included in build output
- [ ] IDE language services respond quickly (project references improve speed)

### Final Verification

- [ ] Git diff shows expected config changes (no accidental reformats)
- [ ] Incremental build test: `tsc -b --clean && tsc -b` is faster on second run
- [ ] Team can verify everything: `tsc -b && bun run test`
- [ ] No new warnings in build output
- [ ] CI/CD pipeline passes all checks

---

## Notes

- **Backward Compatibility**: This migration maintains full compatibility with existing code while improving Bun alignment.
- **NestJS Specifics**: NestJS CLI will continue to work as-is; we're only updating the base TypeScript configs.
- **No Breaking Changes**: All changes are additive or refinements; no existing code needs refactoring unless type errors surface.
- **Gradual Rollout**: Teams can adopt stricter options (like `noUnusedLocals`) per-package after base migration.
