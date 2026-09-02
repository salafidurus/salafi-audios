# Personal State and Synchronization

This context defines how personal state is recorded locally and reconciled with
the backend without treating a client as an authority.

## Language

**Personal state**:
State owned by a User's relationship with content, such as saved status or
listening Progress. It is distinct from public Catalog state.

**Intent**:
A client-recorded request expressing a desired personal-state change. Intent is
not authoritative until accepted by the backend.

**Outbox**:
The durable queue of unsent personal intents awaiting delivery or retry.

**Delta**:
The set of personal-state changes newer than a client's last synchronization
point.

**Tombstone**:
A retained record of a removal or unsave so that a client that was offline can
learn that the relationship no longer exists.

**Reconciliation**:
The process of comparing local intent with backend state and applying the
backend's deterministic result.

**Conflict**:
Two or more competing personal-state changes whose order or meaning must be
resolved before a single state is presented.

**Authoritative state**:
The backend-accepted state that governs future reads and protected actions.

_Avoid_: sync as a promise that every client is always current; cache as a
synonym for authoritative state; offline authority.

## Boundaries

This context applies to personal state only. It does not make Catalog content,
publication, authorization, or editorial state writable offline. Downloaded
audio is device-local availability and is related to Listening, but it is not
itself a cross-device personal-state record.
