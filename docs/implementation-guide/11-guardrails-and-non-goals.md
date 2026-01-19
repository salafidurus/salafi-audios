# Guardrails and Non-Goals

## Introduction

As Salafi Durus grows, the greatest risks are not technical limitations, but **architectural drift**, **implicit decisions**, and **scope creep**.

This document defines:

- Explicit guardrails that must not be violated
- Non-goals that the platform intentionally avoids
- Red flags that indicate design erosion

Its purpose is to preserve clarity, trust, and maintainability over time.

---

## Guardrails: What Must Always Be True

The following guardrails are **non-negotiable**. Any change that violates them must be treated as a defect, not a shortcut.

---

## Backend Authority Is Absolute

- The backend is the single source of truth
- All authoritative writes go through the backend
- Clients never enforce business rules
- Clients never assume authority

If logic starts appearing in clients “because it’s easier,” the system is already drifting.

---

## Clear Separation of Responsibilities

- Mobile, web, backend, and infrastructure have distinct roles
- No platform duplicates another’s responsibilities
- Presentation never owns logic
- Infrastructure never owns policy

If a component “needs to know too much,” the boundaries are wrong.

---

## Data Ownership Rules Are Enforced

- Core relational data lives only in the primary database
- Media files never live in the database
- Analytics data is isolated and non-authoritative
- Client-side persistence is ephemeral

Violating these rules leads to data corruption and long-term instability.

---

## Offline Does Not Grant Authority

- Offline mode records intent, not decisions
- No administrative or editorial actions occur offline
- Backend reconciliation is always required

Offline support exists for continuity, not control.

---

## Authorization Is Never Implicit

- Roles are explicit
- Scope is enforced dynamically
- UI restrictions are not security
- Authorization logic lives only on the backend

If an action is allowed “because the UI hid the button,” it is insecure.

---

## Configuration and Secrets Are Isolated

- Secrets live only on the backend
- Clients receive only public configuration
- Shared packages never contain secrets
- Misconfiguration fails fast

Any secret exposed to a client is a critical issue.

---

## Monorepo Boundaries Are Respected

- Apps depend on packages, not on each other
- Shared packages are pure and reusable
- Circular dependencies are forbidden
- Architectural shortcuts are not allowed “temporarily”

The monorepo is an enforcement mechanism, not a convenience.

---

## CI/CD Is Promotion-Based, Not Push-Based

- Code enters `main` only via pull requests
- Deployments occur via explicit promotion
- Tags represent deployment intent
- Rollbacks move tags, not code

Any process that bypasses this is unsafe.

---

## Non-Goals: What We Intentionally Do Not Build

Non-goals are as important as goals. They prevent dilution of purpose.

---

## No Open User-Generated Content (for now)

Salafi Durus does not support:

- Public comments
- User-submitted lectures
- Social interaction features

This preserves trust, clarity, and moderation control.

---

## No Real-Time Collaboration

The platform does not aim to provide:

- Live multi-user editing
- Real-time shared playback
- Instant cross-device synchronization

Eventual consistency is sufficient for the domain.

---

## No Client-Owned State Authority

Clients do not:

- Decide publication state
- Resolve conflicts independently
- Define canonical ordering
- Own long-term data

Client intelligence never replaces backend authority.

---

## No Over-Engineering Early

The platform intentionally avoids:

- Premature microservices
- Overly abstract frameworks
- Excessive indirection
- Speculative optimization

Complexity is earned, not assumed.

---

## No Hidden Business Logic

Business rules must be:

- Explicit
- Centralized
- Documented
- Testable

If logic cannot be easily located and explained, it does not belong.

---

## Red Flags (Stop and Re-Evaluate)

The following signals indicate architectural drift:

- “We’ll just do it on the client for now”
- “It’s only temporary”
- “We can fix it later”
- “Let’s duplicate this logic quickly”
- “It works, so let’s ship it”

These are not harmless shortcuts; they are long-term liabilities.

---

## Decision-Making Framework

Before introducing a new feature or change, ask:

1. Does this align with the product philosophy?
2. Does it respect trust boundaries?
3. Does it preserve backend authority?
4. Does it fit the existing architecture?
5. Is the added complexity justified?

If the answer to any is “no,” the change should be reconsidered.

---

## Documentation as Enforcement

Documentation is treated as a first-class artifact.

- Architectural changes require documentation updates
- Undocumented behavior is considered incomplete
- Docs reflect intent, not just implementation

This prevents knowledge from becoming implicit or tribal.

---

## Long-Term Stewardship

Salafi Durus is not a short-term project.

Its success depends on:

- Consistency over time
- Discipline in decision-making
- Willingness to say “no” to misaligned features

Guardrails exist to protect the platform from its own growth.

---

## Closing Note

The guardrails and non-goals defined here are not restrictive; they are enabling.

They allow Salafi Durus to grow with confidence, preserve trust, and remain maintainable as contributors change and features evolve.

Every future decision should strengthen these foundations rather than weaken them.
