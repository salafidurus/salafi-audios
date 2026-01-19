# Authentication and Authorization

## Introduction

Authentication and authorization are central to the trust model of Salafi Durus.

They define:
- Who a user is
- What a user is allowed to do
- Which actions affect authoritative platform state

This document describes how identity, sessions, roles, and permissions are implemented and enforced across the platform, and how these mechanisms differ between mobile and web clients.

---

## Core Principles

Authentication and authorization in Salafi Durus follow these principles:

- Identity is explicit and verifiable
- Authority is never implicit
- Permissions are role-based and scope-aware
- All enforcement occurs on the backend
- Clients never bypass or replicate authorization logic

These principles ensure consistency, auditability, and long-term trust.

---

## Authentication Model

### Identity Establishment

Authentication establishes **identity**, not permission.

A successfully authenticated user is known to the system, but may still be restricted from performing most actions.

Authentication is required for:
- Any user-specific state
- Any write operation
- Any administrative or editorial action

Public content discovery does not require authentication.

---

### Token-Based Authentication

Salafi Durus uses a token-based authentication model.

Two token types are used:

- **Access tokens**
  - Short-lived
  - Used for authenticating API requests
  - Included with every protected request

- **Refresh tokens**
  - Long-lived
  - Used only to obtain new access tokens
  - Revocable

This model balances security with usability.

---

### Session Awareness

Each refresh token represents a **session**.

Sessions are:
- Associated with a user
- Independently revocable
- Trackable by device or client type

This allows:
- Logout from individual devices
- Global session revocation
- Controlled recovery from compromise

---

## Authorization Model

### Roles

Authorization is primarily role-based.

Core roles include:
- Listener
- Administrator
- Scholar / Content Editor

Roles define **categories of authority**, not specific permissions.

---

### Scope-Based Restrictions

Some roles require additional scoping.

For example:
- A Scholar Editor may only manage content associated with specific scholars
- An Administrator has platform-wide authority

Scope enforcement:
- Is evaluated on every request
- Is derived from backend state
- Is never inferred from client input

---

### Authorization Enforcement

Authorization checks occur:
- Before any state-modifying operation
- At the backend boundary
- As part of application-level workflows

Authorization is never enforced:
- Only on the client
- Only through obscurity
- Only through UI restrictions

If an action is not explicitly permitted, it is rejected.

---

## Mobile vs Web Authentication

### Mobile Authentication

Mobile clients:
- Store tokens securely on the device
- Attach access tokens to API requests
- Handle token refresh explicitly

Mobile authentication is designed for:
- Long-lived sessions
- Intermittent connectivity
- Offline usage

Refresh operations occur when connectivity is available and never block offline playback.

---

### Web Authentication

Web clients:
- Rely on secure, HTTP-only refresh token storage
- Use short-lived access tokens for API calls
- Refresh access tokens transparently

Web authentication prioritizes:
- Protection against token leakage
- Resistance to cross-site scripting attacks
- Session isolation

---

## Token Refresh and Revocation

### Refresh Behavior

Access tokens are refreshed:
- When expired
- When nearing expiration
- When explicitly requested by the client

Refresh operations:
- Require a valid refresh token
- Issue a new access token
- May rotate refresh tokens if required

---

### Revocation Rules

Refresh tokens may be revoked:
- On explicit logout
- When a session is compromised
- When administrative action requires it

Revoked tokens:
- Cannot be refreshed
- Are treated as invalid immediately

Revocation ensures that lost or leaked tokens do not grant indefinite access.

---

## Administrative and Editorial Authorization

Administrative and editorial actions are the most sensitive operations in the system.

These actions require:
- Verified identity
- Elevated role
- Scope validation
- Explicit intent

Bulk operations, publishing actions, and media replacement are all protected by strict authorization rules.

---

## Offline Behavior and Authorization

Offline mode does not grant additional authority.

While offline:
- Users may consume downloaded content
- Progress may be recorded locally
- No authoritative changes are allowed

Authorization is always evaluated by the backend and never cached as a permanent grant.

---

## Failure and Security Posture

Authentication and authorization systems are designed to fail safely.

If authentication fails:
- The request is rejected
- No partial state changes occur

If authorization fails:
- The action is denied
- No side effects are applied

Failure never results in elevated permissions.

---

## Auditing and Accountability

Authentication and authorization decisions are auditable.

Backend systems should:
- Log sensitive authorization failures
- Track administrative actions
- Associate actions with identities and sessions

This supports accountability and operational oversight.

---

## What Is Explicitly Avoided

Salafi Durus intentionally avoids:

- Client-enforced authorization
- Implicit trust based on client type
- Long-lived access tokens
- Shared credentials
- Hard-coded permissions

These patterns introduce ambiguity and risk.

---

## Closing Note

Authentication and authorization are not auxiliary features in Salafi Durus; they are core enforcement mechanisms.

By clearly separating identity from authority, enforcing permissions centrally, and supporting revocable sessions, the platform preserves trust across users, administrators, and time.

Every change to authentication or authorization must reinforce these guarantees rather than weaken them.
