# Backend Architecture

## Introduction

The backend of Salafi Durus is the **authoritative core** of the platform.

It is responsible for enforcing all business rules, managing data integrity, coordinating media access, and maintaining trust boundaries between users, content, and infrastructure.

This document describes how the backend is structured, how responsibilities are divided, and how logic flows through the system. It does not describe specific frameworks or code, but instead defines architectural layers and rules that any implementation must respect.

---

## Architectural Goals

The backend architecture is designed to:

- Centralize authority and decision-making
- Enforce clear business rules
- Prevent duplication of logic across clients
- Scale independently of presentation layers
- Remain understandable and auditable over time

The backend is not a passive data server. It is an active coordinator and gatekeeper.

---

## Layered Architecture Overview

The backend follows a layered architecture with clear separation of concerns:

1. **Interface Layer**
2. **Application Layer**
3. **Domain Layer**
4. **Infrastructure Layer**

Each layer has a defined role and must not assume responsibilities belonging to another layer.

---

## Interface Layer

### Purpose

The interface layer defines how external systems interact with the backend.

It is responsible for:
- Accepting requests
- Validating input shape
- Authenticating identity
- Routing requests to application logic

### Characteristics

- Exposes HTTP APIs
- Performs request-level validation
- Contains no business rules
- Does not access databases directly

This layer exists to translate external intent into internal actions.

---

## Application Layer

### Purpose

The application layer orchestrates use cases.

It is responsible for:
- Coordinating domain operations
- Enforcing high-level workflows
- Managing transactions
- Applying authorization decisions

### Characteristics

- Implements use cases such as:
  - Publish lecture
  - Update listening progress
  - Replace audio
- Calls domain logic explicitly
- Does not know about HTTP or transport details

This layer answers the question: *What should happen next?*

---

## Domain Layer

### Purpose

The domain layer represents the core business concepts of Salafi Durus.

It defines:
- Entities (e.g., Scholar, Series, Lecture)
- Value objects
- Invariants and constraints
- Domain rules

### Characteristics

- Framework-agnostic
- Free of infrastructure concerns
- Enforces correctness at the model level
- Does not depend on persistence or networking

This layer answers the question: *What is allowed?*

---

## Infrastructure Layer

### Purpose

The infrastructure layer provides technical capabilities required by the domain and application layers.

It includes:
- Database access
- Media storage integration
- Analytics/event storage
- External service adapters

### Characteristics

- Implements interfaces defined elsewhere
- Can be swapped or extended without rewriting business logic
- Contains no decision-making authority

This layer answers the question: *How is it done technically?*

---

## Modular Organization

The backend is organized into modules aligned with domain boundaries.

Each module:
- Encapsulates a specific responsibility
- Owns its data access
- Exposes clear interfaces

### Core Modules

- **Auth**
- **Users**
- **Scholars**
- **Series**
- **Lectures**
- **Progress**
- **Favorites**
- **Uploads**
- **Analytics**
- **Health**

Modules communicate through explicit interfaces, not shared state.

---

## Auth and Authorization as Cross-Cutting Concerns

Authentication and authorization span multiple layers but remain centralized.

Key principles:
- Authentication establishes identity
- Authorization determines permission
- Role and scope checks occur before state changes
- No module bypasses authorization rules

Authorization decisions are enforced in the application layer and validated against domain constraints.

---

## Content Lifecycle Enforcement

The backend is responsible for managing the full content lifecycle:

- Draft
- Review (optional)
- Published
- Archived

Only the backend may:
- Change publication state
- Expose or hide content
- Resolve conflicting edits

This ensures that content visibility remains predictable and auditable.

---

## Media Coordination

The backend does not store media files directly.

Instead, it:
- Authorizes uploads
- Issues time-bound upload permissions
- Records references to media assets
- Controls replacement and visibility

Media is treated as external infrastructure governed by backend-issued authority.

---

## Analytics Isolation

Analytics and event ingestion are architecturally isolated.

Characteristics:
- High write volume
- Non-authoritative
- Failure-tolerant

Analytics failures must not impact core backend operations.

---

## Error Handling and Consistency

The backend enforces consistency by:

- Rejecting invalid state transitions
- Returning explicit error responses
- Avoiding partial writes where possible
- Resolving conflicts deterministically

Errors are treated as part of system behavior, not exceptional edge cases.

---

## Extensibility and Evolution

The backend is designed to evolve through:

- New modules
- Extended domain rules
- Additional integrations

Evolution should occur without:
- Rewriting core logic
- Weakening trust boundaries
- Introducing duplicated rules

---

## Guardrails

To preserve architectural integrity:

- Business rules must not leak into clients
- Infrastructure must not define policy
- Modules must not reach into each other’s internals
- Shortcuts that bypass layers are considered defects

---

## Closing Note

The backend architecture of Salafi Durus exists to protect clarity, trust, and correctness.

By enforcing strict layering, modular boundaries, and centralized authority, the backend remains resilient as the system grows and evolves.

Every backend change should reinforce these principles rather than erode them.
