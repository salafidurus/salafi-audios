# Data and Media Ownership

## Introduction

Data ownership is one of the most important architectural decisions in Salafi Durus.

It determines:

- Where truth lives
- Who has authority to change it
- How the system behaves under failure
- How the platform can evolve over time

This document explains how Salafi Durus treats different kinds of data, why those distinctions exist, and how they support trust, scalability, and long-term preservation.

---

## Categories of Data

Salafi Durus works with three fundamentally different categories of data:

1. **Core relational data**
2. **Media assets**
3. **Analytical and event data**

Each category has different characteristics, requirements, and ownership rules. Treating them identically would introduce unnecessary complexity and risk.

---

## Core Relational Data

### What It Includes

Core relational data represents the authoritative state of the platform. This includes:

- Users and roles
- Scholars
- Series
- Lectures and their metadata
- Publication status and visibility
- Listening progress
- Favorites and library state

This data defines _what the platform is_ at any given moment.

---

### Ownership Model

The backend is the **sole owner and authority** of core relational data.

Key principles:

- All authoritative writes occur on the server
- Clients never directly modify core data stores
- Business rules are enforced centrally

This ensures:

- Consistency across devices
- Predictable moderation behavior
- Clear auditability of changes

Clients may cache or temporarily store copies of this data, but those copies are never treated as authoritative.

---

### Why a Relational Model

The relationships between scholars, series, lectures, and users are fundamental to the platform.

A relational model:

- Preserves these relationships explicitly
- Prevents accidental data drift
- Supports structured queries and long-term integrity

This choice reflects the structured nature of knowledge itself.

---

## Media Assets

### What Counts as Media

Media assets include:

- Audio files for lectures
- Images for scholars and series
- Other static content required for presentation

These assets are fundamentally different from relational data:

- They are large
- They are immutable once published (or change infrequently)
- They are read far more often than they are written

---

### Ownership and Storage

Media assets are stored in dedicated object storage and delivered via a content delivery network (CDN).

Ownership rules:

- The backend controls references to media
- Clients never upload or modify media without backend authorization
- Media storage is treated as durable, external infrastructure

This separation allows the platform to scale media delivery independently from application logic.

---

### Immutability and Replacement

While media files are generally treated as immutable, the platform acknowledges that mistakes occur.

As such:

- Media can be replaced through explicit editorial actions
- Replacement is deliberate, auditable, and reversible
- Metadata updates do not imply media changes by default

This approach balances durability with practicality.

---

## Client-Side Data

### Local State and Caching

Clients are allowed—and encouraged—to store local data for usability purposes, including:

- Downloaded audio files
- Cached metadata
- Temporary listening progress
- Pending synchronization actions

However, this data is considered **ephemeral**.

It exists to:

- Improve responsiveness
- Enable offline functionality
- Reduce unnecessary network usage

Client-side data does not redefine platform state.

---

### Synchronization Philosophy

When clients reconnect:

- Local changes are reconciled with the backend
- The backend resolves conflicts using authoritative rules
- Clients adapt to the resolved state

This ensures that local convenience never compromises global consistency.

---

## Analytical and Event Data

### Purpose

Analytical and event data captures _how_ the platform is used, not _what it is_.

Examples include:

- Playback events
- Completion metrics
- Usage patterns

This data is valuable for understanding behavior and improving the platform, but it is not critical to core functionality.

---

### Separation from Core Data

Analytical data is intentionally isolated from core relational data.

Reasons include:

- Different performance and scaling requirements
- High write volume
- Different retention policies

By separating these concerns, the platform avoids coupling user experience to analytics reliability.

---

## Why Ownership Boundaries Matter

Clear data ownership boundaries provide several benefits:

- **Security**: sensitive data is accessed through controlled paths
- **Resilience**: failures in one system do not cascade
- **Scalability**: each data category can scale independently
- **Clarity**: developers and administrators know where truth lives

Ambiguous ownership leads to fragile systems. Salafi Durus avoids this by design.

---

## Long-Term Implications

The ownership model of Salafi Durus is designed to support longevity.

Years into the future:

- Media assets should remain accessible
- Relational data should remain coherent
- Analytics systems can evolve without rewriting history

By treating data according to its nature rather than convenience, the platform remains adaptable without sacrificing integrity.

---

## Closing Note

Data ownership in Salafi Durus is not an implementation detail; it is a foundational principle.

By clearly separating authority, durability, and responsibility, the platform ensures that knowledge remains preserved, trustworthy, and accessible—regardless of how technology changes around it.
