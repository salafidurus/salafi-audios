# Database and Data Modeling

## Introduction

Data modeling is foundational to the correctness, scalability, and longevity of Salafi Durus.

This document defines how data is structured, stored, and evolved across the platform. It establishes clear rules for what belongs in the primary database, what does not, and how different categories of data are separated to preserve integrity and performance.

This is not a low-level schema specification. It is an implementation guide that defines _principles, responsibilities, and constraints_ for all persistence-related decisions.

---

## Categories of Data

Salafi Durus works with three distinct categories of data:

1. **Core relational data**
2. **Media references**
3. **Analytics and event data**

Each category has different requirements and must be handled independently.

---

## Core Relational Database

### Purpose

The primary relational database represents the **authoritative state of the platform**.

It stores data that defines:

- What content exists
- Who owns or manages it
- What users have done
- What the platform currently considers true

If a piece of data affects platform behavior or user-visible state, it belongs here.

---

### Core Domain Entities

The relational database must model the core domain explicitly and relationally.

At a minimum, it includes:

- **Users**
  - Identity
  - Roles
  - Preferences
  - Account state

- **Scholars**
  - Identity and metadata
  - Active/inactive state
  - Ownership or editorial scope

- **Series**
  - Association to a scholar
  - Ordered grouping of lectures
  - Publication state

- **Lectures**
  - Association to scholar and optional series
  - Metadata (title, description, language)
  - Publication lifecycle state
  - Media references

- **User Progress**
  - Per-user, per-lecture listening state
  - Completion indicators
  - Last updated timestamps

- **Favorites and Library State**
  - Explicit user-curated relationships
  - No derived or inferred state stored here

Optional extensions may include:

- Topics or categories
- Editorial notes
- Audit metadata

---

### Modeling Principles

Core relational data must follow these principles:

- **Explicit relationships**  
  Relationships between entities are modeled directly using foreign keys or equivalent constraints.

- **Normalization over duplication**  
  Data is stored once unless duplication is required for performance or isolation.

- **Predictable identifiers**  
  Internal identifiers are stable and opaque. Public-facing identifiers (such as slugs) are treated separately.

- **State is explicit**  
  Publication status, visibility, and lifecycle transitions are represented explicitly rather than inferred.

- **No derived data**  
  Values that can be derived from other authoritative data are not stored unless necessary.

---

## Media References (Not Media Storage)

### Separation of Concerns

The relational database **does not store media files**.

Instead, it stores **references to media assets**, such as:

- Audio file identifiers
- Image identifiers
- Media variants (if applicable)

This separation ensures that:

- The database remains lightweight
- Media delivery scales independently
- Storage infrastructure can change without schema rewrites

---

### Media Reference Rules

Media references stored in the database must be:

- Immutable by default
- Explicitly versioned or replaceable through editorial actions
- Treated as metadata, not content

Replacing a media asset is a deliberate operation and does not occur implicitly when metadata changes.

---

## Analytics and Event Data

### Purpose

Analytics and event data captures _behavior_, not _state_.

Examples include:

- Playback start events
- Progress updates
- Completion events
- Usage metrics

This data is useful for analysis and improvement, but it is **not authoritative**.

---

### Separation from Core Data

Analytics data must never be stored in the core relational database.

Reasons include:

- High write volume
- Different retention requirements
- Different query patterns
- Tolerance for eventual consistency and loss

Analytics data is stored in a separate system designed for append-only, high-throughput workloads.

---

### Modeling Rules for Analytics

Analytics data:

- Is append-only
- Does not enforce relational constraints
- Is not required for core functionality
- Can be dropped or rebuilt without affecting platform correctness

The platform must remain fully functional even if analytics systems are unavailable.

---

## Client-Side Persistence

### Local Data on Clients

Clients may store local data to support:

- Offline playback
- Cached metadata
- Temporary progress
- Pending synchronization actions

However:

- Client-side data is never authoritative
- It may be replaced or invalidated at any time
- It must reconcile with backend state upon synchronization

Client persistence exists for usability, not ownership.

---

## Migration Strategy

### Schema Evolution

The relational schema is expected to evolve.

Schema changes must:

- Be explicit and versioned
- Be forward-compatible where possible
- Avoid destructive changes without migration paths

Migrations are treated as part of the application lifecycle, not ad-hoc operations.

---

### Backward Compatibility

When possible:

- New columns should be additive
- Existing data should remain valid
- Clients should tolerate missing or additional fields

Breaking schema changes require careful coordination across backend and clients.

---

## What Must Never Be Stored in the Core Database

The following must not be stored in the primary relational database:

- Raw media files
- High-volume analytics events
- Derived or cached values
- Client-specific UI state
- Secrets or credentials

Violations of this rule indicate architectural drift.

---

## Data Integrity and Trust

The database enforces integrity through:

- Constraints
- Explicit state modeling
- Backend-only write access

Clients do not bypass these rules.

All writes to authoritative data occur through validated backend workflows.

---

## Long-Term Data Health

Data modeling decisions are made with longevity in mind.

The schema should:

- Remain understandable years later
- Reflect real domain concepts
- Avoid transient or trend-driven structures

A stable data model enables stable systems.

---

## Closing Note

The database of Salafi Durus is not merely a storage mechanism; it is a representation of truth.

By carefully modeling domain concepts, separating concerns, and enforcing clear ownership boundaries, the platform ensures that data remains trustworthy, scalable, and resilient over time.

All future persistence decisions must align with the principles defined in this document.
