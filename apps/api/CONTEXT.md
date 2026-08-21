# Authority and Editorial Control

This context defines the backend authority that protects durable state and
governs editorial changes to the Catalog.

## Trust and access

**Authority**:
The backend responsibility for deciding and recording business rules, access,
publication visibility, and durable state transitions.

**Policy**:
An enforceable rule that determines whether an action is permitted in a given
context and scope.

**Capability**:
An allowed kind of action, such as writing, translating, publishing, deleting,
or managing.

**Access grant**:
A durable assignment of a Capability to a User for a defined target and scope.

**Scope**:
The boundary within which an Access grant applies, such as globally, for a
Scholar, or for a Locale.

**Deny by default**:
The policy outcome when the requested resource or scope cannot be resolved.
Unknown identity never widens access and never falls back to a broader grant.

**Role**:
A named set of broad responsibilities or system-level authority associated
with a User. A Role does not eliminate per-action policy checks.

_Avoid_: UI gating as authorization; a session as authorization; global access
when the grant is Scholar- or Locale-scoped.

## Editorial lifecycle

**Editorial action**:
An intentional protected change to Catalog state, such as publish, archive,
reorder, replace, translate, or delete.

**Publication state**:
The editorial state that determines whether Catalog content is eligible for
public discovery.

**Transition**:
An allowed movement from one durable editorial state to another, subject to
validation and authorization.

**Replacement**:
An explicit editorial action that substitutes a media reference or other
managed content while preserving the need for authorization and auditability.

## Boundary

The API is the sole authority for protected actions. Web and native clients may
display convenience restrictions and submit intent, but they cannot grant
themselves capabilities or make offline editorial changes.
