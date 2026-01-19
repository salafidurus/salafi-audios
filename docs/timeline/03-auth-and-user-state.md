# Phase 03 — Authentication and User State

## Purpose of This Phase

The Authentication and User State phase introduces **identity** into Salafi Durus.

The goal is to allow users to:
- Identify themselves to the platform
- Maintain personal state
- Begin forming a personal library

This phase deliberately avoids complex playback behavior and offline support. It focuses on **secure identity, session management, and basic user-owned state**.

---

## Outcomes (Definition of Done)

This phase is complete when:

- Users can authenticate on mobile and web
- Sessions are managed securely
- User-specific endpoints are protected
- Favorites and basic library state are supported
- Anonymous users can still browse content

Authentication is optional for browsing but required for personalization.

---

## Scope

### Included
- Authentication flows
- Session management
- Role-aware access control
- Favorites
- Basic user library state

### Explicitly Excluded
- Playback progress
- Offline behavior
- Downloads
- Admin/editor workflows
- Analytics

---

## Backend Responsibilities

### Authentication Endpoints

Implement authentication endpoints that:

- Establish user identity
- Issue access and refresh tokens
- Support token refresh and revocation
- Enforce session boundaries

Authentication must:
- Be token-based
- Support revocable sessions
- Distinguish identity from authority

---

### Authorization Enforcement

Backend must enforce:

- Authenticated access for user-specific endpoints
- Role checks where applicable
- Strict separation between public and user APIs

No client-side authorization is trusted.

---

### User State Modeling

Implement core user-owned state:

- User profile (minimal)
- Favorites (lecture-level)
- Basic library views

This state:
- Belongs only to the user
- Is isolated from global content
- Can be created, updated, and removed

---

## Web Application Responsibilities

### Authentication UX

Implement authentication flows on web:

- Login
- Logout
- Session refresh

Web authentication must:
- Use secure token handling
- Protect against token leakage
- Resolve session state before rendering protected routes

---

### User Library Views

Implement basic authenticated views:

- Favorites list
- User-specific library page

These views:
- Are inaccessible to anonymous users
- Reflect backend-authoritative state
- Do not include playback progress yet

---

## Mobile Application Responsibilities

### Authentication UX

Implement authentication flows on mobile:

- Login
- Logout
- Session persistence

Mobile authentication must:
- Store tokens securely
- Tolerate intermittent connectivity
- Defer refresh when offline

---

### Favorites Interaction

Mobile users can:

- Mark lectures as favorites
- Remove favorites
- View their favorites list

Favorite actions:
- Require authentication
- Are synchronized with the backend when online
- Do not support offline writes yet

---

## Anonymous vs Authenticated Behavior

Anonymous users:
- Can browse all public content
- Cannot save state
- Are encouraged—but not forced—to authenticate

Authenticated users:
- Can save favorites
- Have persistent identity
- Prepare the groundwork for playback state

This distinction must be clear in UI and API behavior.

---

## Security Considerations

This phase validates:

- Token handling correctness
- Session isolation
- Authorization enforcement
- Safe failure behavior

If authentication fails:
- Requests are rejected
- No partial state is created

---

## Non-Goals of This Phase

The following must **not** be implemented yet:

- Playback progress tracking
- Resume functionality
- Offline writes
- Download management
- Administrative permissions

Introducing these too early increases complexity unnecessarily.

---

## Risks Addressed in This Phase

This phase reduces risk by validating:

- Authentication flows across platforms
- Secure session management
- User-specific API boundaries
- UX assumptions around login and identity

Mistakes here are cheaper to fix before playback and offline logic exist.

---

## Common Anti-Patterns to Avoid

- Treating authentication as mandatory for browsing
- Coupling favorites to playback progress
- Allowing partial offline writes
- Granting broad permissions to authenticated users

Identity does not imply authority.

---

## Exit Criteria Checklist

Before moving to Phase 04, confirm:

- [ ] Authentication works on mobile and web
- [ ] Sessions are revocable
- [ ] Public APIs remain accessible without auth
- [ ] Favorites are persisted correctly
- [ ] User endpoints are protected
- [ ] No playback state exists yet

Only after this checklist is complete should playback state be introduced.

---

## Closing Note

Phase 03 introduces *who* the user is, not *what* they do.

By establishing identity and basic personalization cleanly, Salafi Durus prepares for richer listening features without compromising security or architectural clarity.
