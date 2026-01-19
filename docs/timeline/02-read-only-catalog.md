# Phase 02 — Read-Only Catalog

## Purpose of This Phase

The Read-Only Catalog phase delivers the **first end-user–visible value** of Salafi Durus.

The goal is to make scholars, series, and lectures:
- Discoverable
- Navigable
- Consistently structured

This phase intentionally avoids authentication, personalization, offline behavior, and administration. It focuses on validating the **core domain model and data flow** across backend, mobile, and web.

---

## Outcomes (Definition of Done)

This phase is complete when:

- Scholars, series, and lectures can be browsed on mobile and web
- Data flows correctly from backend to clients
- Public APIs expose only published content
- No authentication is required
- No writes occur from clients

Users can explore content, but not yet interact with it.

---

## Scope

### Included
- Core domain entities (read-only)
- Public backend APIs
- Mobile browsing UI
- Web browsing UI
- SEO-ready web pages

### Explicitly Excluded
- Authentication
- Playback progress
- Favorites or library
- Offline downloads
- Admin or editor workflows
- Analytics

---

## Backend Responsibilities

### Domain Modeling

Implement the core domain entities:

- Scholars
- Series
- Lectures

Each entity must have:
- Stable identifiers
- Clear relationships
- Explicit publication state

Only **published** content is exposed.

---

### Public API Endpoints

Expose read-only public endpoints for:

- Listing scholars
- Viewing a single scholar
- Listing series (optionally scoped by scholar)
- Viewing a series and its ordered lectures
- Viewing lecture metadata

These endpoints:
- Require no authentication
- Perform no writes
- Enforce publication visibility strictly

---

### Data Validation

The backend must ensure:
- Draft or archived content is never exposed
- Relationships are consistent
- Ordering is deterministic

This phase validates backend correctness under real client usage.

---

## Web Application Responsibilities

### Public Pages

Implement public pages for:

- Scholar listing
- Scholar detail (with series and lectures)
- Series detail (ordered lectures)
- Lecture detail (metadata only)

These pages:
- Are accessible without login
- Use semantic URLs
- Are server-rendered or statically generated where appropriate

---

### SEO and Discoverability

The web app must:
- Generate correct metadata
- Use canonical URLs
- Support sharing

This phase validates the platform’s discoverability story.

---

## Mobile Application Responsibilities

### Browsing Experience

Implement mobile screens for:

- Scholar list
- Scholar detail
- Series detail
- Lecture detail

The mobile app:
- Fetches data from the public API
- Displays structured content
- Does not store persistent state

---

### Navigation Validation

This phase validates:
- Feature-based navigation structure
- Routing stability
- Screen composition patterns

The mobile app remains online-only at this stage.

---

## Data Flow Validation

This phase is critical for validating:

- API contracts
- Serialization formats
- Error handling
- Loading and empty states

Clients must handle:
- Slow responses
- Missing content
- Empty lists

Graceful failure is required.

---

## Non-Goals of This Phase

The following must **not** be implemented yet:

- Login or signup
- Playback persistence
- Downloads
- Favorites
- Admin actions
- Offline support

If any of these appear, the phase has over-scoped.

---

## Risks Addressed in This Phase

This phase reduces risk by validating:

- Domain model correctness
- API usability
- Client-backend integration
- Navigation and UX assumptions

It surfaces issues early, when they are cheapest to fix.

---

## Common Anti-Patterns to Avoid

- Adding “temporary” auth guards
- Exposing unpublished content “for testing”
- Adding write endpoints “just to try”
- Introducing offline caching prematurely

These undermine the phase’s purpose.

---

## Exit Criteria Checklist

Before moving to Phase 03, confirm:

- [ ] Backend exposes stable public APIs
- [ ] Web pages render correctly and are shareable
- [ ] Mobile app navigates all catalog screens
- [ ] Only published content is visible
- [ ] No client writes exist
- [ ] No auth assumptions exist

Only after this checklist is complete should user state be introduced.

---

## Closing Note

Phase 02 establishes the **spine of Salafi Durus**.

If browsing, structure, and data flow are not correct here, every later feature will suffer. Taking the time to validate the read-only experience ensures that subsequent phases build on a solid, well-understood foundation.
