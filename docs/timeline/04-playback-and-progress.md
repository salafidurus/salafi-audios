# Phase 04 — Playback and Progress

## Purpose of This Phase

The Playback and Progress phase introduces the **core listening experience** of Salafi Durus.

The goal is to allow users to:

- Play lectures reliably
- Track listening progress
- Resume where they left off
- Maintain progress across devices (when online)

This phase intentionally excludes offline downloads and advanced synchronization mechanics. It focuses on correctness, continuity, and trust in the listening experience.

---

## Outcomes (Definition of Done)

This phase is complete when:

- Audio playback works on mobile and web
- Listening progress is tracked and persisted
- Users can resume lectures from their last position
- Progress syncs across devices when online
- Playback failures degrade gracefully

Listening becomes a first-class, stateful experience.

---

## Scope

### Included

- Audio playback
- Progress tracking
- Resume functionality
- Online cross-device synchronization
- Basic playback error handling

### Explicitly Excluded

- Offline downloads
- Offline progress writes
- Outbox synchronization
- Admin uploads
- Analytics ingestion

---

## Backend Responsibilities

### Playback Metadata

The backend provides:

- Lecture audio references
- Duration metadata (when available)
- Playback-safe URLs

The backend does not stream audio itself.

---

### Progress Endpoints

Implement progress-related endpoints that:

- Accept progress updates from authenticated users
- Store per-user, per-lecture progress
- Expose recent or incomplete progress
- Resolve conflicts deterministically

Progress updates must:

- Be idempotent
- Be tolerant of repeated submissions
- Never corrupt authoritative state

---

### Progress Visibility Rules

Progress data:

- Is private to the user
- Is never exposed publicly
- Is accessible only to the authenticated owner

The backend enforces strict ownership.

---

## Mobile Application Responsibilities

### Audio Playback

The mobile application must:

- Play audio reliably in foreground and background
- Handle interruptions gracefully
- Expose basic playback controls (play, pause, seek)

Playback logic:

- Is isolated in core infrastructure
- Is independent of UI screens
- Emits progress events to the application layer

---

### Progress Recording

Mobile progress recording:

- Records playback position periodically
- Sends updates while online
- Avoids excessive network usage
- Sends a final update on pause or completion

Progress recording is throttled and deliberate.

---

### Resume Behavior

When a user opens a lecture:

- The app requests the last known progress
- Playback resumes from that position
- Resume behavior is explicit and predictable

If no progress exists, playback starts from the beginning.

---

## Web Application Responsibilities

### Web Playback

The web application must:

- Support audio playback in supported browsers
- Provide basic playback controls
- Handle buffering and loading states

Web playback does not support background playback.

---

### Progress Synchronization

While online:

- Web playback updates progress in real time or near real time
- Progress is synced with backend
- State remains consistent across sessions

Web and mobile use the same backend APIs.

---

## Cross-Device Behavior (Online)

When a user switches devices while online:

- The most recent progress is fetched from the backend
- Playback resumes from the latest known position
- Minor discrepancies are resolved via backend rules

Perfect synchronization is not required; continuity is.

---

## Error Handling

Playback errors must:

- Be surfaced clearly to the user
- Not crash the application
- Not corrupt progress data

Progress update failures:

- Do not block playback
- May retry opportunistically
- Never result in partial or invalid state

---

## User Experience Expectations

This phase establishes critical UX expectations:

- Playback feels reliable
- Resume behavior is trustworthy
- Progress is not lost during normal usage

Breaking trust here undermines the platform.

---

## Non-Goals of This Phase

The following must **not** be implemented yet:

- Offline playback
- Download management
- Outbox sync
- Progress conflict resolution for offline scenarios
- Analytics and metrics

Adding these prematurely increases risk.

---

## Risks Addressed in This Phase

This phase reduces risk by validating:

- Playback integration on both platforms
- Progress data modeling correctness
- Backend idempotency
- Cross-device continuity assumptions

Errors here are easier to correct before offline support is added.

---

## Common Anti-Patterns to Avoid

- Writing progress on every second
- Treating playback state as authoritative
- Allowing progress updates without authentication
- Coupling playback logic to UI components

Playback is infrastructure, not UI logic.

---

## Exit Criteria Checklist

Before moving to Phase 05, confirm:

- [ ] Audio plays reliably on mobile and web
- [ ] Progress persists correctly
- [ ] Resume behavior is predictable
- [ ] Progress syncs across devices when online
- [ ] Playback failures do not corrupt state
- [ ] No offline logic exists yet

Only after this checklist is complete should offline support be introduced.

---

## Closing Note

Phase 04 delivers the heart of Salafi Durus.

If playback and progress do not feel reliable at this stage, offline support will only amplify the problems. Taking the time to validate listening behavior now ensures that the platform can confidently move toward offline-first capabilities next.
