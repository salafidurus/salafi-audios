# Dependency automation policy

This document defines the ownership boundary between Dependabot,
`dependabot-helper`, and catalog alignment. The boundary is intentional: one
dependency update must have one owning updater.

## Ownership summary

| System                                | Owns                                                                                             | Must not do                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Dependabot                            | Ordinary dependency and GitHub Actions updates                                                   | Update dependencies owned by a compatibility pipeline           |
| `dependabot-helper`                   | Compatibility-sensitive updates and invariant checks that Dependabot cannot safely resolve alone | Re-propose ordinary dependencies or create proposals for checks |
| `dependabot-helper` catalog alignment | Workspace version alignment, policy evaluation, repair reporting, and lockfile validation        | Act as a competing dependency-version source or updater         |

## Dependabot

Dependabot is the default owner for ordinary package updates. Its groups and
ignore rules are the executable policy for routine dependency pull requests.

The exact `jest` runtime and `@types/jest` are one review unit. That unit is
limited to minor and patch updates. The `@types/jest` package must be excluded
from any broad `@types/*` group so a major update cannot bypass this boundary.

Other Jest-family packages, including `@jest/*`, `jest-*`, and `ts-jest`, are
reviewable separately from the exact Jest runtime/types pair. The exception is
`jest-expo`, which is ignored by Dependabot because it belongs to the Expo
compatibility pipeline.

Web Testing Library packages may be grouped together. Native Testing Library
packages remain outside that web group and are reviewed independently.

## `dependabot-helper`

`dependabot-helper` is the single public boundary for updates that require
repository-aware coordination and for checks that enforce dependency
invariants. Its typed policy classifies each family as Dependabot-owned,
helper-owned, or helper-checked.

The Expo pipeline selects the Expo SDK target, updates the Expo dependency,
runs `expo install --fix`, and then runs `expo-doctor`. `jest-expo` is managed
only as part of this pipeline; it is not a standalone candidate.

The Bun pipeline updates the package manager declaration and related Bun
metadata together.

If a future compatibility-sensitive dependency needs helper ownership, it must
be declared in the typed helper policy with an ecosystem-specific pipeline and
validation contract. It must also be removed from ordinary Dependabot groups.

Helper checks, including Prisma and Better Auth exact-version checks, validate
the current repository state without creating update proposals. A failed
resolver, validation command, install, or lockfile operation rejects the
update transaction and must not leave an accepted partial update.

## Catalog alignment

The Dependabot Helper owns catalog alignment as a bounded repair capability. It
synchronizes workspace `package.json` references with the root Bun catalog and
reports or repairs catalog drift after an update has already been authorized.
Package-manager catalog data remains in `package.json`; automation ownership
and compatibility policy remain in the typed helper policy.

Catalog alignment does not independently select dependency versions. For
Dependabot pull requests, `dependabot-sync` invokes the helper, applies the
repair report, installs to validate the lockfile, checks the output file
allowlist, and writes back only generated dependency files. A rejected repair
fails closed and produces an audit result.

For compatibility groups, the catalog records the owning pipeline and its
validation commands. The Expo group is owned by `expo-pipeline` and is executed
by `dependabot-helper`; the catalog does not compete with that pipeline.

## Change checklist

When adding or moving a dependency between owners:

1. Update the relevant executable configuration.
2. Ensure no other updater can propose the same dependency independently.
3. Add or update the ownership-resolution test at the existing automation seam.
4. Update this policy when the boundary or validation contract changes.
5. Verify the generated dependency files and lockfile with the owning workflow.

The executable configuration is authoritative for behavior; this document is
the human-readable contract and must remain consistent with it.
