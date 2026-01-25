# Phase 06 — Offline and Downloads

## Purpose of This Phase

The Offline and Downloads phase introduces **offline-first listening** to Salafi Durus.

The goal is to allow users to:

- Download lectures for offline playback
- Continue listening without connectivity
- Preserve progress recorded offline
- Synchronize safely when connectivity is restored

This phase activates the synchronization mechanics designed earlier and validates them under real-world usage.

---

## Outcomes (Definition of Done)

This phase is complete when:

- Users can download lectures on mobile
- Downloaded lectures play reliably offline
- Progress recorded offline is preserved
- Offline actions synchronize safely when online
- Failures degrade gracefully without data loss

Offline listening becomes a reliable, trusted experience.

---

## Scope

### Included

- Download management (mobile)
- Offline playback
- Offline progress recording
- Outbox-based synchronization
- Conflict-tolerant reconciliation

### Explicitly Excluded

- Admin/editor actions offline
- Bulk media management
- Analytics ingestion
- Background content updates

---

## Backend Responsibilities

### Offline-Tolerant Endpoints

The backend must support:

- Idempotent progress update endpoints
- Safe retries for repeated submissions
- Deterministic conflict resolution

Backend endpoints must assume:

- Delayed delivery
- Duplicate requests
- Out-of-order submissions

---

### Conflict Resolution Rules

Backend conflict resolution must:

- Favor the most recent valid update
- Treat completion as terminal where appropriate
- Reject invalid state transitions

Conflict resolution logic lives exclusively on the backend.

---

## Mobile Application Responsibilities

### Download Management

The mobile application must support:

- Explicit user-initiated downloads
- Tracking download state and size
- Removing downloaded content
- Resolving playback source (local vs remote)

Downloads are:

- Stored locally
- Indexed in local persistence
- Associated with a specific **audio asset** (the lecture’s primary at download time)

---

### Offline Playback

When offline:

- Playback uses local media files
- UI reflects offline state accurately
- Playback does not attempt network access

Offline playback must feel identical to online playback.

---

### Offline Progress Recording

While offline:

- Progress is recorded locally
- Updates are queued in the outbox
- No network calls are attempted

Progress updates must:

- Be timestamped
- Be mergeable
- Be durable across app restarts

---

## Synchronization Mechanics

### Outbox Processing

When connectivity is restored:

1. Outbox entries are processed in order
2. Each entry is submitted to the backend
3. Backend responses update local cache
4. Successfully applied entries are removed

Outbox processing:

- Retries on failure
- Uses backoff
- Does not block UI

---

### Progress Reconciliation

When syncing progress:

- Backend resolves conflicts
- Backend returns authoritative state
- Client updates local state accordingly

Clients never attempt to reconcile conflicts independently.

### Download vs Progress Separation

- Downloads reference a **specific audio asset**
- Progress remains **lecture-scoped**
- Backend reconciliation preserves lecture continuity even if audio assets are replaced

---

## User Experience Expectations

This phase establishes strong UX guarantees:

- Downloads are explicit and visible
- Offline playback is reliable
- Progress is not lost
- Synchronization happens quietly

Users should never need to “manage” synchronization.

---

## Error Handling

Offline-related errors must:

- Be non-fatal
- Not interrupt playback
- Surface only when action is required

Common failure scenarios include:

- Partial downloads
- Interrupted sync
- Temporary backend unavailability

All failures must preserve user trust.

---

## Non-Goals of This Phase

The following must **not** be implemented yet:

- Offline administrative actions
- Automatic background downloads
- Content refresh while offline
- Analytics-based offline insights

These features increase complexity without core benefit.

---

## Risks Addressed in This Phase

This phase reduces risk by validating:

- Outbox reliability
- Offline progress durability
- Conflict resolution correctness
- Storage and cleanup behavior

Offline bugs discovered later are far more costly.

---

## Common Anti-Patterns to Avoid

- Treating local state as authoritative
- Syncing on every small progress change
- Blocking playback on sync failures
- Allowing offline admin actions

Offline support must never weaken trust boundaries.

---

## Exit Criteria Checklist

Before moving to Phase 07, confirm:

- [ ] Downloads work reliably
- [ ] Offline playback functions correctly
- [ ] Offline progress is preserved
- [ ] Synchronization resolves conflicts correctly
- [ ] UI reflects offline state clearly
- [ ] No offline admin features exist

Only after this checklist is complete should admin workflows be introduced.

---

## Closing Note

Phase 06 fulfills the promise of Salafi Durus as an offline-first platform.

By carefully activating downloads and synchronization only after playback correctness is established, the platform ensures that offline support strengthens—rather than undermines—the listening experience.
