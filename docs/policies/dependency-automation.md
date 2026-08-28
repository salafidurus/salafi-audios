# Dependency automation policy

This document defines how dependency proposals, coordinated updates, invariant
checks, and catalog alignment are divided. The boundary is intentional: one
dependency family must have one proposal owner.

## Ownership summary

| System | Owns | Must not do |
| --- | --- | --- |
| Dependabot | Ordinary dependency and GitHub Actions updates | Update dependencies owned by a compatibility pipeline |
| `dependabot-helper` | Compatibility-sensitive updates and invariant checks that Dependabot cannot safely resolve alone | Re-propose ordinary dependencies or create proposals for checks |
| Catalog alignment | Bounded normalization of authorized manifests, catalogs, and lockfiles | Select dependency versions or act as an update owner |

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

An ordinary dependency is Dependabot-owned. A helper-owned family is one whose
safe upgrade requires an ecosystem-specific resolver or command. A
helper-checked family remains Dependabot-owned, but the helper validates an
invariant after Dependabot proposes the change.

The Expo pipeline selects the Expo SDK target, updates the Expo dependency,
runs `expo install --fix`, and then runs `expo-doctor`. `jest-expo` is managed
only as part of this pipeline; it is not a standalone candidate.

Every package in a helper-owned family must be ignored by Dependabot in each
relevant ecosystem entry. This prevents Dependabot from creating a competing
proposal while the helper performs the coordinated update.

The Bun pipeline updates the package manager declaration and related Bun
metadata together.

If a future compatibility-sensitive dependency needs helper ownership, it must
be declared in the typed helper policy with a special resolver, an
ecosystem-specific update pipeline, and a validation contract. The family must
also be removed from every relevant ordinary Dependabot group and ignored by
Dependabot. A resolver without an executable validation path is not sufficient
to establish helper ownership.

Helper checks, including Prisma and Better Auth exact-version checks, validate
the current repository state without creating update proposals. A failed
resolver, validation command, install, or lockfile operation rejects the
update transaction and must not leave an accepted partial update.

## Catalog alignment

The Dependabot Helper exposes catalog alignment as a bounded repair capability.
It synchronizes workspace `package.json` references with the root Bun catalog
and reports or repairs catalog drift after an update has already been
authorized. Package-manager catalog data remains in `package.json`; automation
ownership and compatibility policy remain in the typed helper policy.

Catalog alignment does not independently select dependency versions. During
Dependabot synchronization or a helper-owned transaction, it may apply only
authorized manifest, catalog, and lockfile changes. It reports its mutations,
validates the resulting lockfile, and fails closed when the repair is
ambiguous, out of scope, or unsuccessful.

The Expo family is owned by `dependabot-helper` and uses its special resolver
and validation commands. Catalog alignment may support that transaction, but
it does not compete with the helper pipeline.

## Version-locked and helper-checked families

Prisma and Better Auth remain Dependabot-owned. The helper checks that every
member of each configured family resolves to exactly the same version. A failed
check rejects the update; it does not open a second proposal or silently repair
an unrelated dependency.

The same helper-check model applies to future families whose updates are safe
to propose through Dependabot but must satisfy an explicit repository invariant.

## Change checklist

When adding or moving a dependency between owners:

1. Update the relevant executable configuration.
2. Ensure no other updater can propose the same dependency independently.
3. Add or update the ownership-resolution test at the existing automation seam.
4. Update this policy when the boundary or validation contract changes.
5. Verify the generated dependency files and lockfile with the owning workflow.

The executable helper policy and native Dependabot configuration are
authoritative for behavior. This document is the human-readable ownership and
rationale contract; it must not become a second package-membership policy.
