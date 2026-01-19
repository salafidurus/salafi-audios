# API Design

## Introduction

The API of Salafi Durus is the primary interface between all clients and the authoritative backend.

It is not a thin data layer. It is an explicit contract that:

- Encodes business intent
- Enforces data ownership rules
- Preserves trust boundaries
- Protects long-term compatibility

This document defines how the API is structured, how responsibilities are segmented, and how it aligns with the platform’s data model and synchronization philosophy.

---

## API as a Contract

The API represents a long-lived contract between:

- Mobile clients
- Web clients
- The backend system

This contract must be:

- Explicit in meaning
- Stable over time
- Backward-compatible where possible

Clients should never rely on undocumented behavior or inferred semantics. If something matters, it must be represented explicitly in the API.

---

## Versioning Strategy

All API endpoints are versioned explicitly.

- Versions are part of the URL
- Only one active version is maintained initially
- New versions are introduced deliberately

Versioning exists to:

- Protect deployed clients
- Allow controlled evolution
- Prevent silent breaking changes

Once an API version is published, its semantics must remain stable.

---

## Alignment with Data Ownership

The API is designed to reflect the platform’s data ownership rules.

- All authoritative writes go through the API
- Clients never write directly to data stores
- Derived or cached values are not persisted through the API

The API exposes _state_, not _implementation details_.

---

## API Surface Segmentation

The API is segmented by **audience and authority**.

### Public Endpoints

Public endpoints:

- Require no authentication
- Expose only published, public data
- Are safe to cache aggressively

Typical use cases:

- Browsing scholars
- Viewing series and lectures
- Public search and discovery

Public endpoints never expose:

- Draft or archived content
- Editorial metadata
- User-specific state

---

### Authenticated User Endpoints

Authenticated user endpoints:

- Require a verified user identity
- Operate only on the caller’s personal state
- Never modify shared or authoritative content

Typical use cases:

- Updating listening progress
- Managing favorites
- Retrieving personal library data

These endpoints are explicitly scoped to the authenticated user and are isolated from global state.

---

### Administrative and Editorial Endpoints

Administrative endpoints:

- Require elevated roles
- Modify authoritative platform state
- Are never publicly accessible

Typical use cases:

- Creating and editing scholars, series, and lectures
- Publishing or archiving content
- Uploading or replacing media
- Performing bulk editorial operations

Administrative endpoints are guarded rigorously and audited carefully.

---

## Resource-Oriented Design

The API models domain concepts as explicit resources:

- Scholars
- Series
- Lectures
- Users

Resources are manipulated using:

- Clear HTTP methods
- Explicit identifiers
- Intent-driven sub-actions where necessary

The API avoids overloading generic update endpoints with hidden behavior.

---

## Intent-Driven Actions

Some operations represent **state transitions**, not simple updates.

Examples include:

- Publishing content
- Archiving content
- Reordering lectures
- Replacing audio

These actions are expressed explicitly in the API rather than inferred from generic updates.

This ensures:

- Clarity of intent
- Safer state transitions
- Auditable behavior

---

## Validation and Error Handling

All inputs are validated at the API boundary.

Validation ensures:

- Required fields are present
- Data types and formats are correct
- Invalid state transitions are rejected early

Error responses are:

- Structured
- Explicit
- Consistent across endpoints

Clients should never need to guess why a request failed.

---

## Pagination, Filtering, and Ordering

Endpoints returning collections must support:

- Pagination
- Deterministic ordering
- Explicit filtering options

Pagination protects the backend from unbounded queries and enables predictable client behavior.

Filtering rules are explicit and documented. Implicit filtering based on hidden logic is avoided.

---

## Authentication and Authorization Enforcement

Authentication and authorization are enforced uniformly across the API.

Key principles:

- Authentication establishes identity
- Authorization determines allowed actions
- Authorization is evaluated on every protected request

No endpoint assumes trust based on client type or origin.

---

## Media Access Through the API

The API coordinates all media access.

It:

- Authorizes uploads
- Issues time-bound upload permissions
- Records media references in the database
- Controls replacement and visibility

Clients never interact directly with media infrastructure without explicit backend authorization.

---

## Analytics and Event Endpoints

Analytics and event ingestion endpoints:

- Accept high-volume, append-only events
- Do not modify authoritative state
- Are tolerant of duplication and loss

Failure of analytics endpoints must not affect core user workflows.

Analytics APIs are intentionally isolated from content and user-state APIs.

---

## Consistency Across Clients

The same API serves:

- Mobile applications
- Web applications
- Administrative interfaces

There are no client-specific APIs.

Behavior differences are driven by:

- Authentication
- Authorization
- Role and scope

This ensures consistency and reduces duplication.

---

## Stability Over Convenience

API design prioritizes:

- Explicitness over brevity
- Stability over shortcuts
- Clarity over cleverness

Endpoints that are easy to understand and difficult to misuse are preferred over minimalistic but ambiguous designs.

---

## Deprecation and Evolution

When API changes are necessary:

- Deprecation is explicit
- Behavior changes are documented
- Clients are given time to migrate

Silent changes in behavior are avoided.

---

## Closing Note

The API of Salafi Durus is a foundational asset.

By aligning API design with data ownership, authorization boundaries, and synchronization philosophy, the platform ensures long-term stability and trust.

Every API decision should reinforce clarity, safety, and durability.
