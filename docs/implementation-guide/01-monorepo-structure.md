# Monorepo Structure



## Introduction



Salafi Durus is developed as a single monorepo containing all client applications, backend services, and shared packages.



This structure is intentional. It exists to:

- Enforce architectural consistency

- Enable safe code sharing

- Reduce duplication of logic

- Support coordinated evolution across platforms



This document defines the monorepo layout, explains the responsibilities of each part, and establishes rules that prevent architectural drift over time.



---



## Why a Monorepo



A monorepo is chosen because Salafi Durus is a **single system**, not a collection of unrelated applications.



The mobile app, web app, and backend:

- Share domain concepts

- Share API contracts

- Evolve together



Keeping them in one repository ensures that changes remain aligned and reduces the risk of silent incompatibilities.



---



## High-Level Structure



At the root of the repository, the structure is divided into three primary areas:



- `apps/` — deployable applications

- `packages/` — shared libraries and configuration

- `docs/` — architectural and product documentation



```txt

/

├── apps/

├── packages/

├── docs/

├── package.json

├── turbo.json

└── pnpm-workspace.yaml
```

Each area has a clearly defined purpose and boundary.
 
---

## Applications (apps/)

The `apps/` directory contains deployable runtime applications.

Each application:
- Has its own lifecycle
- Is built and deployed independently
- Consumes shared packages but does not export them


### Applications in Salafi Durus

```txt

apps/

├── mobile/

├── web/

└── api/
```

`apps/mobile`

- Expo-based mobile application
- Primary listening experience
- Supports offline playback and mobile administration
- Contains no backend logic or secrets

`apps/web`

- Web application for public access and administration
- Handles SEO, discovery, and bulk editorial workflows
- Does not bypass backend authorization

`apps/api`

- Backend service
- Single source of truth
- Enforces authentication, authorization, and business rules
- Coordinates database, media, and analytics access

---

## Shared Packages (packages/)

The `packages/` directory contains non-deployable shared code.

Packages:

- Must be platform-agnostic where possible
- Contain no application-specific assumptions
- Are versioned and imported explicitly

### Typical Packages

```txt
packages/

├── db/

├── api-client/

├── auth-shared/

├── config/

└── i18n/
```

`packages/db`

- Database schema and migrations
- Shared data models
- Used only by the backend

`packages/api-client`

- Typed API client
- Shared between mobile and web
- Reflects backend contracts

`packages/auth-shared`

- Shared auth types (roles, token payloads)
- No secrets
- Used by all platforms for consistency

`packages/config`

- Shared configuration schemas
- Linting and TypeScript base configs
- No runtime secrets

`packages/i18n`

- Shared internationalization configuration
- Translation key definitions

---

## Documentation (docs/)

The `docs/` directory contains authoritative documentation.

These documents:

- Define architectural intent
- Explain trade-offs and constraints
- Serve as onboarding material

Documentation is treated as part of the codebase and evolves alongside it.

---

## Dependency Rules

To preserve structure and prevent tight coupling, the following rules apply:

### Allowed Dependencies

- Apps may depend on packages
- Packages may depend on other packages
- Apps may not depend on other apps

### Forbidden Dependencies

- Packages must not import from apps
- Clients must not import backend-only logic
- No circular dependencies across package boundaries

These rules ensure that shared code remains reusable and that applications remain isolated.

---

## Import Conventions

Imports should reflect architectural intent.

Preferred:

- Explicit, scoped imports
- Clear ownership of modules

Discouraged:

- Deep, fragile import paths
- Global barrels that obscure dependencies

Barrel exports may be used sparingly at package boundaries, but not as a default within feature modules.

---

## Tooling and Coordination

The monorepo uses a task orchestrator to:

- Run builds, tests, and linting efficiently
- Cache results across applications
- Ensure only affected projects are rebuilt

This enables:

- Fast local development
- Predictable CI pipelines
- Incremental changes without full rebuilds

---

## Environment Isolation

Even within a monorepo, environments remain isolated.

- Each app loads its own environment variables
- Secrets are never shared through packages
- Shared packages contain schemas, not values

This prevents accidental leakage of sensitive information.

---

## Evolution of the Monorepo

The monorepo is expected to grow.

New applications or packages may be added if they:

- Have a clear responsibility
- Respect existing boundaries
- Do not duplicate existing functionality

Structure should evolve deliberately, not organically.

---

## Guardrails Against Drift

To prevent architectural decay:

- Documentation must be updated with structural changes
- New shared code must justify its placement
- Shortcuts that bypass boundaries are treated as defects

The monorepo is not just a convenience—it is an enforcement mechanism.

---

## Closing Note

The monorepo structure of Salafi Durus is a foundational decision.

By clearly separating deployable applications from shared packages and enforcing strict dependency rules, the system remains coherent, scalable, and maintainable over time.

All contributors are expected to understand and respect this structure.
