# Phase 06 — Admin and Uploads

## Purpose of This Phase

The Admin and Uploads phase introduces **content management and moderation workflows** into Salafi Durus.

The goal is to enable trusted administrators and scholar editors to:

- Create and manage scholars, series, and lectures
- Upload and replace media safely
- Control publication state
- Moderate content quickly and responsibly

This phase activates the editorial side of the platform while preserving all previously established trust boundaries.

---

## Outcomes (Definition of Done)

This phase is complete when:

- Admin and scholar editor roles are fully functional
- Content can be created, edited, published, and archived
- Single and bulk media uploads work reliably
- Media replacement is safe and auditable
- Mobile and web admin workflows are clearly differentiated

The platform becomes self-sustaining from a content perspective.

---

## Scope

### Included

- Admin and scholar editor roles
- Content CRUD (scholars, series, lectures)
- Single and bulk uploads
- Media replacement
- Publishing and moderation workflows
- Admin capabilities on both mobile and web

### Explicitly Excluded

- Public user submissions
- Automated ingestion pipelines
- Offline admin actions
- Advanced analytics dashboards

---

## Backend Responsibilities

### Role and Scope Enforcement

The backend must enforce:

- Administrator vs scholar editor roles
- Scholar-level scoping for editors
- Explicit permission checks on every admin action

Authorization failures must:

- Reject the action
- Produce no side effects

---

### Content Lifecycle Management

Implement full content lifecycle control:

- Draft
- Review (optional)
- Published
- Archived

Only published content is visible publicly.

Lifecycle transitions:

- Are explicit API actions
- Are validated centrally
- Are auditable

---

### Upload Authorization

The backend must:

- Authorize all media uploads
- Issue time-limited upload permissions
- Validate upload purpose and ownership
- Record media references only after successful upload

Media ingestion must never bypass backend coordination.

---

## Web Application Responsibilities

### Admin Dashboard

The web application is the **primary editorial workspace**.

It must support:

- Scholar management
- Series management
- Lecture management
- Bulk upload workflows
- Batch editing and ordering
- Publishing and archiving actions

The web UI prioritizes:

- Visibility
- Efficiency
- Accuracy

---

### Bulk Upload Workflow

Web-based bulk uploads must:

- Group files under a single session
- Allow metadata editing after upload
- Support ordering and batch publishing
- Surface validation errors clearly

Bulk workflows are web-only.

---

## Mobile Application Responsibilities

### Mobile Administration

The mobile application supports **fast, focused admin actions**.

Mobile admin features include:

- Editing metadata
- Publishing or archiving content
- Replacing media
- Emergency moderation actions

Mobile admin does **not** support:

- Large bulk uploads
- Complex batch editing
- High-volume content creation

Mobile administration prioritizes speed and correctness.

---

### Single Upload Workflow

Mobile uploads:

- Are single-item only
- Are explicitly initiated
- Are reliable under intermittent connectivity
- Use the same backend authorization rules as web

Uploads may retry safely if interrupted.

---

## Media Replacement Rules

Replacing media is an explicit editorial action.

Rules include:

- Replacement requires elevated permissions
- Old media references are retained or archived
- Replacement does not affect unrelated metadata
- Replacement actions are auditable

Media replacement must never occur implicitly.

---

## Moderation and Safety

Admin workflows must support:

- Rapid unpublishing
- Correcting metadata mistakes
- Replacing incorrect media
- Clear visibility into publication state

Moderation actions must be:

- Fast
- Reversible
- Clearly scoped

---

## User Experience Expectations

For administrators and editors:

- Actions are explicit
- Failures are clearly communicated
- No action is ambiguous or silent
- Publishing state is always visible

Trust in editorial tools is essential.

---

## Non-Goals of This Phase

The following must **not** be implemented yet:

- Public content submissions
- Automated moderation
- Recommendation systems
- Analytics-driven publishing decisions

These features add complexity without supporting core goals.

---

## Risks Addressed in This Phase

This phase reduces risk by validating:

- Admin authorization correctness
- Upload and media handling reliability
- Content lifecycle enforcement
- Mobile vs web responsibility separation

Mistakes here are expensive; strict enforcement is required.

---

## Common Anti-Patterns to Avoid

- Allowing admin actions without backend validation
- Exposing bulk workflows on mobile
- Treating uploads as fire-and-forget
- Bypassing lifecycle states “for convenience”

Editorial shortcuts undermine trust.

---

## Exit Criteria Checklist

Before moving to Phase 07, confirm:

- [ ] Admin and editor roles work correctly
- [ ] Content can be created and published safely
- [ ] Single and bulk uploads function reliably
- [ ] Media replacement is explicit and auditable
- [ ] Mobile and web admin scopes are respected
- [ ] No offline admin actions exist

Only after this checklist is complete should analytics and polish be added.

---

## Closing Note

Phase 06 completes the **content loop** of Salafi Durus.

With reliable administration, moderation, and uploads in place, the platform is no longer dependent on manual data seeding and is ready to scale responsibly.
