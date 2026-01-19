# Offline Synchronization Mechanics

## Introduction

Offline support in Salafi Durus is not a convenience feature; it is a core requirement.

This document describes how offline actions are recorded, how they are synchronized with the backend, and how conflicts are resolved. It formalizes the mechanics that allow the mobile application to function reliably without continuous connectivity while preserving backend authority.

The goal is **predictable behavior**, not perfect real-time consistency.

---

## Core Principles

Offline synchronization follows these principles:

- The backend remains the source of truth
- Clients may record intent, not authority
- Synchronization is eventual, not immediate
- Conflicts are resolved deterministically
- Failures degrade gracefully

Offline capability must never weaken trust boundaries.

---

## Types of Offline Data

Offline-capable data in Salafi Durus falls into three categories:

1. **Offline-readable data**
2. **Offline-writable data**
3. **Offline-only data**

Each category is treated differently.

---

## Offline-Readable Data

Offline-readable data includes:

- Downloaded audio files
- Cached lecture metadata
- Cached scholar and series information

This data is:
- Read-only while offline
- Safe to cache
- Replaceable when online data is refreshed

Offline-readable data improves continuity but does not alter platform state.

---

## Offline-Writable Data

Offline-writable data represents **user intent** recorded while offline.

Examples include:
- Listening progress updates
- Marking a lecture as completed
- Adding or removing favorites

This data:
- Is recorded locally
- Is queued for synchronization
- Does not immediately affect backend state

Offline-writable data must always be synchronizable.

---

## Offline-Only Data

Offline-only data includes:

- Local playback state
- Temporary UI state
- Retry counters and sync metadata

This data:
- Is never synchronized
- Has no backend representation
- May be discarded at any time

---

## Local Persistence Strategy

The mobile application uses local persistence to support offline behavior.

Local storage is responsible for:
- Tracking downloaded media
- Storing cached metadata
- Recording offline actions
- Preserving progress across restarts

Local persistence is **not** a mirror of the backend database. It is a working set optimized for usability.

---

## The Outbox Pattern

### Purpose

Offline synchronization is implemented using an **outbox pattern**.

The outbox records:
- What action occurred
- What entity it affected
- When it occurred
- Whether it has been synchronized

This ensures that offline actions are not lost and can be retried safely.

---

### Outbox Characteristics

Outbox entries:
- Are append-only
- Represent intent, not result
- Are processed in order where necessary
- May be retried multiple times

Outbox entries are removed only after successful synchronization.

---

## Synchronization Triggers

Synchronization may occur when:

- Network connectivity is restored
- The application returns to foreground
- A periodic background task runs
- A user explicitly refreshes data

Synchronization is opportunistic, not blocking.

---

## Synchronization Flow

A typical synchronization flow is:

1. Client detects connectivity
2. Client processes pending outbox entries
3. Each entry is sent to the backend
4. Backend validates and applies the action
5. Backend returns authoritative state
6. Client updates local cache accordingly
7. Outbox entry is removed

Failures at any step do not corrupt state.

---

## Conflict Resolution

### Nature of Conflicts

Conflicts may occur when:
- Multiple devices update progress independently
- Offline updates overlap with online updates
- Sync is delayed for extended periods

Conflicts are expected and handled explicitly.

---

### Resolution Strategy

Conflict resolution is backend-driven.

Typical strategies include:
- Last-write-wins based on timestamps
- Completion overrides partial progress
- Backend state supersedes stale client data

Clients never attempt to resolve conflicts independently.

---

## Idempotency and Safety

Offline synchronization must be idempotent.

This means:
- Replaying the same action multiple times has the same effect
- Duplicate submissions do not corrupt state
- Network retries are safe

Backend endpoints handling offline sync must be designed accordingly.

---

## Progress Synchronization

Listening progress:
- Is recorded locally at regular intervals
- Is queued for synchronization periodically
- Is reconciled with backend state

Progress updates are:
- Throttled
- Collapsed when possible
- Treated as eventually consistent

Perfect accuracy is less important than continuity.

---

## Favorites and Library Sync

Favorites and similar actions:
- Are recorded as discrete events
- Are synchronized in order
- Resolve deterministically on the backend

If conflicts occur, backend rules define the final state.

---

## Error Handling and Retries

Synchronization failures:
- Do not block playback
- Do not surface intrusive errors to users
- Are retried with backoff

Only unrecoverable failures require user intervention.

---

## Guarantees

Salafi Durus aims to guarantee that:

- Offline actions are not silently lost
- Playback remains uninterrupted
- Backend state eventually reflects user intent
- Synchronization does not corrupt authoritative data

These guarantees focus on trust and predictability.

---

## Non-Guarantees

Salafi Durus does not guarantee:

- Real-time synchronization
- Perfect cross-device alignment at all times
- Preservation of every intermediate state
- Offline execution of administrative actions

These trade-offs preserve simplicity and robustness.

---

## Security Considerations

Offline mode does not elevate privileges.

While offline:
- No administrative actions are executed
- No publication state changes occur
- No backend authority is assumed

All authoritative changes require backend validation.

---

## Observability

Synchronization systems should be observable.

The backend should:
- Log synchronization failures
- Track retry patterns
- Monitor conflict frequency

This data informs improvements without affecting core behavior.

---

## Closing Note

Offline synchronization in Salafi Durus is designed to balance usability with correctness.

By recording intent locally, reconciling centrally, and resolving conflicts deterministically, the platform provides a reliable experience without fragile real-time dependencies.

Every offline-related feature must respect these mechanics to preserve trust and consistency.
