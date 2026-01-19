# Phase 01 — Foundations

## Purpose of This Phase

The Foundations phase establishes the technical and operational baseline for Salafi Durus.

The goal of this phase is **not** to deliver user-facing features. Instead, it ensures that:
- The repository structure is correct
- Tooling and workflows are reliable
- Deployment paths are safe and repeatable
- Future development can proceed without rework

This phase prioritizes **correctness over speed**.

---

## Outcomes (Definition of Done)

This phase is considered complete when:

- The monorepo is fully bootstrapped
- CI pipelines run reliably
- Environments are clearly separated
- Mobile, web, and backend apps can start and run
- No shortcuts are taken that would require undoing later

Nothing in this phase should be “temporary”.

---

## Scope

### Included
- Repository setup
- Tooling configuration
- Environment scaffolding
- CI/CD foundations
- Skeleton applications

### Explicitly Excluded
- End-user features
- Authentication flows
- Content management
- Offline behavior
- Analytics

---

## Repository Setup

### Monorepo Initialization

- Initialize monorepo using the agreed structure:
  - `apps/`
  - `packages/`
  - `docs/`
- Configure workspace tooling
- Ensure dependency resolution works across apps and packages

### Directory Structure

Ensure the following directories exist and are valid:

```txt
apps/
├── api/
├── web/
└── mobile/

packages/
├── db/
├── api-client/
├── auth-shared/
├── config/
└── i18n/

docs/
```

Each application must be independently runnable.

---

## Tooling and Standards

### Package Management

- Use a single package manager across the repo
- Lock versions deterministically
- Ensure installs are reproducible

---

## Code Quality

- Linting configured at the root
- Formatting rules enforced consistently
- Type checking enabled for all apps
- Failing checks block merges

---

## Task Orchestration

- Configure a task runner to:
  - Build affected projects only
  - Cache results
  - Speed up local development and CI

This is required for a monorepo of this size.

---

## CI/CD Foundations

### Continuous Integration

CI must run on:

- Every pull request
- Every merge to `main`

CI responsibilities:

- Install dependencies
- Run linting
- Run type checks
- Run tests (if any)
- Fail fast on errors

No deployment occurs during CI.

---

## Protected Main Branch

- `main` is fully protected
- No direct pushes allowed
- All changes enter via pull requests
- Required checks must pass before merge

This is mandatory.

---

## Deployment Promotion Skeleton

Set up—but do not yet fully automate—the promotion workflow:

- Manual promotion workflow exists
- Tag creation is controlled
- No one needs to push commits to `main` locally

At this stage, it is acceptable for deployments to be stubbed or no-op.

---

## Environment Scaffolding

### Environment Definitions

- Define `development`, `preview`, and `production`
- Set up environment variable handling for:
  - Backend
  - Web
  - Mobile

No secrets are committed.

---

## Backend Environment

- Backend can boot with environment variables
- Configuration validation exists
- Invalid configuration causes startup failure

---

## Web Environment

- Web app can start in development mode
- Environment variables are injected correctly
- Public vs private configuration is respected

---

## Mobile Environment

- Mobile app can start locally
- Environment-specific configuration is injected
- App builds without runtime crashes

---

## Application Skeletons

### Backend Skeleton

- Backend application boots successfully
- Health endpoint responds
- No domain logic yet
- Database connection may be mocked or stubbed

---

## Web Skeleton

- Web application renders a placeholder page
- Routing is functional
- Build and dev modes work

---


## Mobile Skeleton

- Mobile app launches
- Navigation works
- No real data is required yet

---

## Documentation Alignment

- Product Overview is committed
- Implementation Guide is committed
- Timeline docs directory exists
- Any deviations discovered during setup are documented

Documentation is treated as part of the deliverable.

---

## Risks Addressed in This Phase

This phase prevents:

- CI chaos
- Environment leakage
- Branch protection mistakes
- Deployment ambiguity
- Architectural rework later

Skipping this phase guarantees pain later.

---

## Common Anti-Patterns to Avoid

- “We’ll fix CI later”
- “Let’s just hardcode this for now”
- “We don’t need environments yet”
- “Let’s ship a feature first”

These shortcuts undermine everything that follows.

---

## Exit Criteria Checklist

Before moving to Phase 02, confirm:

- [] Monorepo structure is stable
- [] CI runs on PRs
- [] Environments are clearly separated
- [] Main branch is protected
- [] Apps boot independently
- [] Environments are defined
- [] Documentation is up to date

Only after this checklist is complete should feature development begin.

---

## Closing Note

Phase 01 is an investment.

It may feel slow, but it determines whether Salafi Durus grows smoothly or painfully. Once this foundation is in place, all subsequent phases can move faster with confidence.

Build the ground properly before building on top of it.
