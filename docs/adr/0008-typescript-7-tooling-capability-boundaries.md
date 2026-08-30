# ADR 0008: Establish TypeScript 7 tooling capability boundaries

## Status

Accepted

## Context

The repository's primary compiler is currently TypeScript 5.9.3. The proposed
TypeScript 7 upgrade is not, by itself, evidence that the repository's tools
can consume the new compiler or preserve their existing output contracts.

The repository has several different compiler boundaries:

- Turbo invokes package-local `tsc` commands through the public `typecheck`
  script and the root project references.
- Shared packages emit declarations through either `tsc` or `tsup`.
- The API runs TypeScript source through Bun and SWC; Nest CLI is not its build
  boundary.
- Expo and Next.js own application transformation while TypeScript supplies
  checking and editor metadata.
- Prisma generation creates artifacts consumed by `@sd/core-db` and its
  downstream packages.
- React Doctor uses compiler APIs and currently declares a TypeScript range
  below version 6.
- Dependabot Helper and CI wrappers run compiler-dependent checks outside the
  application packages.

The capability audit therefore evaluates each boundary independently. A
dependency-only compiler bump cannot certify project references, native
platform declaration selection, declaration output, generated clients, or
compiler-API consumers.

## Decision

- TypeScript 7 is the owner of the repository's future public compiler path.
- The existing root `typecheck` command remains the only developer-facing
  typecheck contract.
- A compatibility compiler may be used only inside the owning tool that needs
  it. The repository must not publish a second compatibility `typecheck`
  command.
- A replacement is acceptable only when its observable behavior and outputs
  are contract-equivalent to the tool it replaces.
- React Doctor remains a locked, blocking dependency on its supported legacy
  TypeScript path until a supported TypeScript 7 implementation or
  contract-equivalent replacement exists.
- The React Doctor CLI and the React Doctor OxLint plugin remain separate
  decisions. Keeping the CLI's compiler exception does not remove or weaken
  the plugin's lint rules and suppressions.
- The API remains a Bun/SWC runtime transformation boundary. Compiler settings
  for decorators and metadata must be reviewed separately from Nest CLI
  ownership.
- Native module resolution must be audited as a platform boundary. A native
  import must not resolve to a web-only declaration merely because a compiler
  accepts the import.
- Required tooling remains locked in the repository dependency graph. Optional
  experiments must not become floating `bunx @latest` validation.

## Capability audit

The classifications below describe the capability boundary and the evidence
required to certify it. “TypeScript 7-compatible” means the tool can run on
the TypeScript 7-owned path while preserving its repository contract. “Replaceable”
means the current path is not required when a named alternative preserves that
contract. “Compatibility exception-only” means the tool must remain isolated
behind its own legacy compiler boundary until its support changes.

| Capability | Repository boundary | Classification | Evidence and contract check | Owner |
| --- | --- | --- | --- | --- |
| Typechecking | Root `typecheck`, package `typecheck` scripts, and Turbo task graph | TypeScript 7-compatible | Run the root and package checks under TypeScript 7; preserve dependency order and diagnostics ownership | #745 |
| Project references | Root `tsconfig.json` and composite package projects | TypeScript 7-compatible | Run the complete reference graph with `tsc -b`; verify every referenced project is checked exactly once | #745 |
| Declaration emit | `tsc` build configs and `tsup` declaration mode | TypeScript 7-compatible | Build every declaration package; compare declarations, declaration maps, exports, and CJS/ESM entry points | #745/#748 |
| Module resolution | Bundler, Node10, package exports, aliases, and native suffixes | TypeScript 7-compatible | Run focused probes for package exports, aliases, `.native` precedence, and `.web` fallback; native resolution must remain native-first | #744/#745 |
| Editor/compiler integrations | React Doctor and compiler-API consumers | Compatibility-exception-only | Inspect declared compiler API ranges and run each supported command from the frozen install; this classification applies specifically to React Doctor | #747 |
| Package builds | `tsc`, `tsup`, Bun, Next.js, and Expo build boundaries | TypeScript 7-compatible | Run filtered builds and inspect emitted files, source maps, package exports, and runtime entry points | #745/#748 |
| Linting | OxLint, `oxlint-tsgolint`, and React Doctor plugin | TypeScript 7-compatible | Run OxLint and the React Doctor plugin independently; preserve diagnostics and suppressions | #747 |
| Framework tooling | Expo/Metro, Next.js/SWC, and API Bun/SWC execution | Replaceable | Confirm framework transforms and API decorator metadata without routing runtime builds through TypeScript emit; unused Nest CLI is handled by #746 | #746 |
| Generated-client paths | Prisma generation and `@sd/core-db` consumers | TypeScript 7-compatible | Generate Prisma output, typecheck consumers, and verify generated exports and runtime imports | #745/#748 |
| CI wrappers | Dependabot Helper, Turbo, GitHub Actions, Docker install/build paths | TypeScript 7-compatible | Run frozen installation and CI-equivalent checks; classify wrapper failures by owning root, compiler API, or network boundary | #748 |

The audit is evidence-backed only when the command result is recorded with the
tool version, compiler version, configuration used, and any failure's owning
boundary. A package manifest mentioning TypeScript is not sufficient evidence
that the package consumes the compiler at runtime.

The tool-level classifications are:

| Tool | Classification | Boundary rationale |
| --- | --- | --- |
| TypeScript compiler and project-reference driver | TypeScript 7-compatible | Owns the repository's public compiler path after #745's adoption and parity checks |
| `tsup` | TypeScript 7-compatible | Declares a TypeScript peer range and must preserve package declaration/build outputs |
| Turbo | TypeScript 7-compatible | Orchestrates commands and ordering; it does not own a second compiler contract |
| Bun/SWC, Next.js/SWC, and Expo/Metro | TypeScript 7-compatible | Runtime transformation is independent of TypeScript emit; TypeScript resolution remains subject to the platform gate |
| Prisma generator and generated-client consumers | TypeScript 7-compatible | Generated artifacts must remain consumable by the TypeScript 7-owned checks |
| OxLint, `oxlint-tsgolint`, and React Doctor OxLint plugin | TypeScript 7-compatible | Linting remains an independent boundary and must preserve existing diagnostics and suppressions |
| Nest CLI | Replaceable | The API uses Bun/SWC and does not require Nest CLI as its runtime build boundary; removal is #746's implementation |
| React Doctor CLI | Compatibility-exception-only | Its locked `typescript >=5.0.4 <6` requirement has no supported TypeScript 7 path in the current dependency |
| Dependabot Helper | TypeScript 7-compatible | Its check must run with an explicit repository root boundary; the observed `TS6059` is a wrapper configuration failure, not a reason to expose a public compatibility compiler |

## Compatibility boundary

The compatibility boundary has three layers:

1. **Repository-owned path:** TypeScript 7 runs the public `typecheck` command,
   project references, package checks, and compiler-driven validation that can
   preserve the repository contracts.
2. **Tool-owned exception:** A tool that requires an unsupported compiler API
   may invoke its locked legacy compiler internally. That invocation must be
   scoped to the tool, have a reproducible installation, and report failures
   as that tool's failure rather than as repository typecheck output.
3. **Contract gate:** The boundary is removed only after parity checks prove
   equivalent declarations, exports, source maps, aliases, decorators, and
   generated artifacts. A successful process exit without those checks is not
   sufficient.

The compatibility layer must not alter application source resolution, runtime
transformation, package ownership, or the meaning of the root `typecheck`
command. It is an implementation detail of the exception-owning tool.

## React Doctor exception

The locked React Doctor dependency currently declares
`typescript >=5.0.4 <6`. It is therefore an explicit compatibility exception,
not evidence against TypeScript 7 ownership of the repository. The exception
requires:

- the React Doctor version to remain locked in `package.json` and `bun.lock`;
- the React Doctor command to remain blocking and reproducible from a frozen
  install;
- its legacy compiler use to remain internal to React Doctor;
- no public compatibility typecheck script to be added; and
- the React Doctor OxLint plugin to remain independently linted and available.

## Contract-equivalence gate

For every tool classified as compatible or replaceable, the implementation
work must check the applicable contracts:

- **Declarations:** public names, types, overloads, optionality, visibility,
  declaration maps, and generated declaration completeness.
- **Exports:** package `exports`, `types`, CJS/ESM entry points, and import
  behavior used by API, web, native, and package consumers.
- **Source maps:** emitted map presence, source roots, and mappings for builds
  that currently publish maps.
- **Path aliases and resolution:** configured aliases, package exports,
  bundler resolution, and platform suffix precedence.
- **Decorators:** API decorator metadata and runtime transformation through
  Bun/SWC, without assuming TypeScript emit is the runtime authority.
- **Generated artifacts:** Prisma client generation, generated exports, and
  downstream typechecking/runtime imports.
- **CI wrappers:** frozen installation, Turbo task ordering, Docker-oriented
  build paths, and diagnostics that identify the owning tool.

The parity gate compares outputs and externally observable behavior, not
private compiler implementation details.

## Evidence commands

The following commands are the canonical evidence seams. They must be run from
the implementation checkout with the repository's pinned Bun version and a
frozen dependency installation:

```bash
bun install --frozen-lockfile --ignore-scripts
bun run build
bun run lint
bun run typecheck
bun run test
bun run --filter @sd/core-db prisma:generate
bun run dependabot-helper align
bun run doctor
bun run verify:build-configs
```

Focused compiler probes may be run in a writable temporary directory when the
aggregate command cannot identify the owning failure. They must record the
exact TypeScript version and configuration. In particular, the TypeScript 7
probe must retain the known native `expo-status-bar` declaration-resolution
case and the Dependabot Helper root-boundary case as diagnostic evidence; the
fixes belong to the dependent tickets.

## Recorded evidence

The implementation checkout confirmed Bun `1.4.0`, TypeScript `5.9.3`, and
React Doctor `0.9.12` before editing. The dependency tree matches the locked
manifest versions for TypeScript, `tsup`, Turbo, OxLint, the React Doctor CLI,
and the React Doctor plugin.

The aggregate TypeScript 5 baseline and the TypeScript 7 probe results are
recorded in #742. The TypeScript 7 probe reached native application code and
selected `expo-status-bar/build/StatusBar.web.d.ts` for a native import. The
Dependabot Helper probe reached `updates/ci.ts` and reported `TS6059` for the
dynamic import of `scripts/utils/paths.mjs`; an explicit repository root probe
passed, identifying the root boundary rather than a product-code regression.

The implementation checkout could not reproduce the aggregate commands because
`bun install --frozen-lockfile --ignore-scripts` was blocked by registry DNS
resolution after the initial temp-directory failure. This is setup evidence,
not a compatibility classification. The dependent implementation tickets must
rerun the commands after a complete frozen installation.

## Consequences

The repository has one public compiler contract and an explicit policy for
legacy tools. Future compiler upgrades must repeat this capability audit rather
than infer support from a dependency diff or a single green package check.

The audit makes failures attributable: native declaration selection belongs to
the platform-resolution boundary, React Doctor belongs to its tool-owned
compatibility boundary, API decorator behavior belongs to Bun/SWC, and Prisma
output belongs to the generated-client boundary.

This ADR does not upgrade TypeScript, change application behavior, modify
native declarations, remove Nest CLI tooling, isolate React Doctor, or certify
CI parity. Those changes are owned by #744–#748.
