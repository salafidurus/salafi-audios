# Mobile Application Structure

## Introduction

The mobile application of Salafi Durus is the primary listening interface and a critical administrative surface.

It must support:

- Long-form audio playback
- Offline-first usage
- Reliable synchronization
- Fast moderation and editorial actions

This document defines how the mobile application is structured, how responsibilities are divided internally, and how the architecture supports scalability without becoming brittle.

---

## Structural Philosophy

The mobile application is organized around **separation by responsibility**, not by technical type.

The structure emphasizes:

- Feature isolation
- Clear ownership of logic
- Minimal coupling between unrelated concerns
- Predictable data flow

The application avoids monolithic “services” or global state containers that obscure intent.

---

## Top-Level Directory Structure

The mobile application follows this structure:

```txt
src/
├── app/
├── core/
├── features/
└── shared/
```

Each directory has a strict and intentional purpose.

---

## `app/` — Routing and Composition

### Purpose

The `app/` directory is responsible only for routing and high-level composition.

It:

- Defines navigation structure
- Wires providers and layouts
- Imports screens from features

It does not:

- Contain business logic
- Fetch data directly
- Own application state

### Responsibilities

- Route definitions
- Layout composition
- Authentication guards at the routing level
- Navigation transitions

This keeps routing declarative and predictable.

---

### `core/` — Application Infrastructure

### Purpose

The `core/` directory contains platform-wide infrastructure.

It represents the foundational systems that all features rely on but do not own.

### Typical Contents

The `core/` directory includes:

- API layer
  - API client
  - Authentication headers
  - Token refresh logic
  - Error normalization
- Authentication
  - Session state
  - Secure token storage
  - Login/logout flows
- Playback
  - Audio player integration
  - Queue and track lifecycle
  - Playback state coordination
- Persistence
  - Local database initialization
  - Repositories for local storage
  - Migration handling
- Synchronization
  - Offline outbox
  - Retry logic
  - Conflict reconciliation triggers
- Configuration
  - Environment access
  - Feature flags
  - Constants

### Rules

- `core/` contains no UI
- `core/` contains no feature-specific logic
- Features depend on `core/`, not the other way around

---

## `features/` — Domain-Oriented Functionality

### Purpose

The `features/` directory contains vertical slices of user-facing functionality.

Each feature:

- Owns its screens
- Owns its hooks and state
- Encapsulates its domain logic
- Depends on core/ for infrastructure

### Feature Structure

Each feature follows a consistent internal layout:

```txt
features/<feature-name>/
├── screens/
├── components/
├── hooks/
├── stores/
├── types/
└── index.ts (optional, minimal)
```

### Responsibilities

- Screens assemble UI and hooks
- Hooks encapsulate data fetching and coordination
- Stores manage local UI state where necessary
- Components are feature-specific and reusable within the feature
- Types describe feature-local data models

Features do not:

- Implement authentication
- Store tokens
- Call storage APIs directly
- Enforce backend business rules

---

## `shared/` — Reusable Building Blocks

### Purpose

The `shared/` directory contains **cross-feature reusable primitives**.

These are generic utilities and components that have no domain ownership.

### Typical Contents

- UI components (buttons, cards, headers)
- Generic hooks (debounce, network status)
- Utility functions (formatting, helpers)
- Shared types and constants

### Guardrails

- Shared code must be domain-agnostic
- Feature-specific components must not be promoted prematurely
- Shared is not a dumping ground

If something is tied to a single domain concept, it belongs in a feature.

---

## Data Flow in the Mobile App

Read Flow

1. Screen renders
2. Feature hook requests data via API client
3. API client handles authentication and refresh
4. Data is cached and returned
5. UI renders state

### Write Flow

1. User performs an action
2. Feature hook records intent
3. If online, API is called immediately
4. If offline, intent is queued locally
5. Synchronization resolves state when possible

This ensures consistent behavior across connectivity states.

---

## Offline Responsibilities

The mobile app is responsible for:

- Downloading media for offline playback
- Resolving local vs remote playback sources
- Recording progress locally
- Queueing offline actions safely

The mobile app is not responsible for:

- Resolving authoritative conflicts
- Publishing or modifying content state
- Making trust decisions

Offline capability improves continuity, not authority.

---

## Administrative Capabilities on Mobile

The mobile app supports administrative and editorial actions.

These actions:

- Use the same API as web
- Are guarded by the same authorization rules
- Favor single-item workflows
- Prioritize speed and correctness

Mobile administration is designed for:

- Quick moderation
- Metadata correction
- Media replacement
- Emergency actions

Bulk operations remain better suited to the web interface.

---

## State Management Strategy

State management follows these guidelines:

- Server state is handled through request caching mechanisms
- UI state is kept local to features
- Persistent state is stored only when necessary
- Global state is minimized

This reduces cognitive load and prevents unintended coupling.

---

## Import and Dependency Rules

- Features may import from `core/` and `shared/`
- `core/` may import from `shared/`
- `shared/` must not import from features or `core/`
- Circular dependencies are treated as defects

These rules preserve architectural clarity.

---

## Evolution and Maintenance

The mobile application structure is designed to scale:

- New features add new directories
- Existing features remain isolated
- Core infrastructure evolves independently
- Shared primitives grow cautiously

Refactors are localized rather than systemic.

---

## Closing Note

The mobile application architecture of Salafi Durus prioritizes clarity, resilience, and real-world usability.

By separating routing, infrastructure, features, and shared primitives, the app remains flexible without becoming fragmented.

Every addition to the mobile app should reinforce these boundaries and responsibilities.
