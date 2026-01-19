# Contributing to Salafi Durus

Thank you for your interest in contributing to **Salafi Durus**.

This project is built with a strong emphasis on **trust, clarity, and long-term maintainability**. Contributions are welcome, but they must adhere to the architectural principles and guardrails defined in this repository.

This document explains **how to contribute responsibly** and what is expected of contributors.

---

## Before You Contribute

Before writing any code, you are expected to read and understand the project documentation.

### Required Reading

At minimum, please read:

1. **Documentation Index**  
   `docs/README.md`

2. **Product Overview**  
   `docs/product-overview/`

3. **Implementation Guide**  
   `docs/implementation-guide/`

4. **Current Timeline Phase**  
   `docs/timeline/`

These documents define the **source of truth** for how the system is designed and how it must evolve.

If something is unclear, ask before implementing.

---

## Contribution Philosophy

Salafi Durus is not an experimental playground. It is a carefully designed system.

All contributions must:

- Respect backend authority
- Preserve clear responsibility boundaries
- Avoid architectural shortcuts
- Prefer explicitness over cleverness
- Favor long-term clarity over short-term convenience

If a change introduces ambiguity, it is likely not acceptable.

---

## Branching and Pull Requests

### Branching Rules

- `main` is the only long-lived branch
- Direct pushes to `main` are not allowed
- All changes must be introduced via pull requests

Create feature branches off `main`:

```txt
feature/<short-description>
```

---

### Pull Request Requirements

Every pull request must:

- Be focused on a single concern or change
- Pass all CI checks (linting, type checks, tests if present)
- Respect the current Timeline phase
- Avoid introducing unrelated refactors or scope expansion
- Include documentation updates if behavior or intent changes

Pull requests that “work” but violate architectural principles will be rejected.

---

## Scope Control (Very Important)

Before implementing a change, confirm:

- Which **Timeline phase** the change belongs to
- Whether the feature is explicitly included in that phase
- Whether it conflicts with any documented non-goals

If a change belongs to a later phase, it must wait.

Scope creep is treated as a defect, not a productivity win.

---

## Code Structure Expectations

### Monorepo Rules

The repository follows strict structural boundaries:

- Applications live in `apps/`
- Shared packages live in `packages/`
- Documentation lives in `docs/`

Rules:
- Apps must not depend on other apps
- Shared packages must not depend on apps
- Circular dependencies are forbidden

Violations must be corrected before merge.

---

### Mobile Application Structure

The mobile application follows this structure:

```txt
src/
├── app/
├── core/
├── features/
└── shared/
```

Rules:
- `shared/` contains pure, reusable primitives
- `core/` may import from `shared/`
- `features/` may import from `core/` and `shared/`
- `app/` is used only for routing and composition

Business logic must not live in `app/`.

Violations of these rules must be corrected before merge.

---

### Web Application Structure

The web application follows a similar separation of concerns:

- `app/` defines routing, layouts, and metadata
- `features/` contain domain-oriented UI logic
- `core/` handles infrastructure (API client, auth state, caching)
- `shared/` contains reusable, domain-agnostic primitives

The web application is a **client of the backend**, not a backend itself.

Use of Next.js route handlers (`app/api/`) is restricted to:
- thin proxy endpoints
- integrations or webhooks

They must never replace or duplicate backend business logic.

---

### Backend Structure

Backend code must:

- Treat the backend as the **single source of truth**
- Enforce all business rules centrally
- Separate interface, application, domain, and infrastructure layers
- Avoid leaking infrastructure concerns into domain logic

If business rules appear in mobile or web clients, the implementation is incorrect.

---

## Authentication and Authorization

All contributions must respect the following rules:

- Authentication establishes identity only
- Authorization determines permission
- Authorization is enforced exclusively on the backend
- UI restrictions are not security

Any change that weakens authorization boundaries will be rejected.

---

## Offline and Synchronization Rules

Offline behavior must follow the documented model:

- Clients record intent, not authority
- Offline writes use the outbox pattern
- Backend resolves conflicts deterministically
- Offline mode never enables administrative actions

Do not introduce alternative synchronization mechanisms.

---

## Documentation Responsibilities

Documentation is a **first-class artifact**.

You must update documentation if you:

- Change architectural intent
- Introduce a new pattern
- Modify guarantees or constraints
- Adjust responsibilities between components

Undocumented behavior is considered incomplete.

---

## Testing and Quality Expectations

All contributions must:

- Pass linting and type checks
- Handle errors explicitly
- Avoid silent failures
- Fail safely under error conditions

Do not suppress errors to make tests pass.

---

## Deployment and Releases

Contributors must **not**:

- Push directly to `main`
- Create or move deployment tags
- Deploy to preview or production environments

Deployment promotion is restricted and handled via controlled workflows.

---

## What Will Be Rejected

Common reasons for rejection include:

- “Temporary” architectural shortcuts
- Client-side enforcement of business rules
- Logic duplication across platforms
- Features introduced outside the current Timeline phase
- Undocumented behavior
- Over-engineering without clear justification

Rejection is about protecting the system, not personal criticism.

---

## Asking Questions and Proposing Changes

If you are unsure about an approach:

- Ask before implementing
- Propose changes via issues or draft pull requests
- Reference relevant documentation sections

Thoughtful discussion is encouraged; undocumented implementation is not.

---

## Final Note

Salafi Durus is designed to preserve knowledge with responsibility.

Every contribution affects not just the codebase, but the trust users place in the platform. Please contribute with care, discipline, and respect for the system’s design.

Thank you for helping build Salafi Durus correctly.

