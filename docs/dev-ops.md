# Infrastructure and DevOps

## 1. Environment Model

Salafi Durus uses three named environments across applications and deployment targets:

- **development**
- **preview**
- **production**

These names should be explicit in configuration. Clients must not infer environment from hostname patterns alone.

## 2. Environment Responsibilities

- **Development**: latest approved work from `main`, debug-friendly settings, CI and internal testing.
- **Preview**: staging-like validation with production-like behavior.
- **Production**: live traffic, real data, stricter controls, and lower tolerance for operational risk.

## 3. Configuration Rules

- Each environment has isolated variables and secrets.
- Backend secrets live only on the backend or in secure secret stores.
- Clients receive only explicit public configuration such as API URLs and other non-sensitive values.
- Missing or invalid critical configuration must fail fast.

## 4. Configuration Sources

- **Backend**: startup-loaded environment variables and secure secret stores.
- **Web**: build-time public variables plus server-side runtime configuration where appropriate.
- **Mobile**: build-time injected public configuration and environment-specific app config.

Schemas may be shared across apps, but values are never shared through packages.

## 5. Branch-Deploy Workflow

Deployments follow protected branch promotion:

- `main` -> development
- `preview` -> preview
- `production` -> production

### Promotion Rules

1. All changes enter `main` via pull request.
2. Promotions to `preview` and `production` happen through pull requests between protected branches.
3. Rollbacks are handled by revert or restore through reviewed pull requests.

## 6. Security and Auditability

- Direct pushes to deployment branches are blocked.
- Promotion history is visible through commits and pull requests.
- Credentials must be revocable and scoped to minimum required access.
- Hard-coded secrets, runtime config mutation, and implicit environment inference are avoided.

## 7. Dependabot Policy

Dependabot is configured in `.github/dependabot.yml` with conservative defaults suited to this monorepo.

### Ignored Dependencies

The following dependency groups are **explicitly ignored** by Dependabot because they are version-locked to SDK releases or framework internals. Updating them independently risks breaking native builds, type compatibility, or coordinated version matrices:

- **Expo / React Native / React Navigation** — all pinned to the current Expo SDK. Upgrades follow the [Expo SDK upgrade guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) as a coordinated batch.
- **React / React DOM / @types/react** — shared across web (Next.js) and mobile (Expo). Version is dictated by the Expo SDK and Next.js major.
- **Next.js** — major upgrades require migration guides and build config changes.
- **Prisma / @prisma/\*** — ORM client, engine, and CLI must stay in exact lockstep.
- **NestJS / @nestjs/\*** — framework packages share a strict version matrix.
- **Turborepo** — build orchestrator; caching behavior can change between versions.
- **TypeScript** — compiler upgrades affect every package; managed manually per the ts-modernization plan.

### How to Handle SDK-Aligned Updates

1. Create a dedicated branch (e.g. `chore/expo-sdk-52`).
2. Follow the upstream migration guide for the SDK or framework being upgraded.
3. Update **all** coupled packages in a single PR so the lockfile stays consistent.
4. Run the full validation suite (see below) before requesting review.

### Validation Commands for Dependency PRs

Every Dependabot PR (and any manual dependency update) must pass:

```bash
pnpm typecheck   # Ensures no type regressions across the monorepo
pnpm build        # Verifies all apps and packages compile cleanly
pnpm test         # Runs unit and integration tests
pnpm test:e2e     # Runs Playwright end-to-end tests (web)
```

CI enforces these automatically; reviewers should verify all checks are green before merging.

### Playwright Browser Caching in CI

The CI workflow caches Playwright browser binaries at `$GITHUB_WORKSPACE/.cache/ms-playwright`, keyed on `pnpm-lock.yaml`. When Dependabot bumps `playwright` or `@playwright/test`, the lockfile hash changes, causing a cache miss. The CI job detects this and re-installs browsers automatically (`playwright install --with-deps`). No manual intervention is required — the next run after a Playwright bump simply takes slightly longer.
