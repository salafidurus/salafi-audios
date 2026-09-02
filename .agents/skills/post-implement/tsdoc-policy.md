# TSDoc review policy

Review documentation as part of the implementation diff. A comment is useful
when it helps a future caller preserve behavior that is not obvious from the
declaration and its types.

## Review checklist

For every changed public seam, check intent, caller-visible behavior, identity,
ordering and lifecycle invariants, side effects, failure behavior, consistency
with tests, concision, and duplication. Prioritize API clients, hooks, adapters,
route boundaries, stateful components, and semantic fields.

## Review examples

Reject comments that only restate the declaration:

```ts
/** Updates the user. */
export function updateUser(id: string, data: UpdateUserInput) {}
```

Prefer the contract callers need:

```ts
/**
 * Applies editable profile fields to the user identified by `id`.
 * Undefined fields are omitted; authorization and immutable identity fields
 * remain controlled by the API. The returned user reflects server state.
 */
export function updateUser(id: string, data: UpdateUserInput) {}
```

Reject stale comments when behavior changes, and reject placeholders such as:

```ts
/** Documents the intent and contract of this declaration. */
```

An intentional omission should be explainable:

```markdown
- No comment added to `nextIndex`: private local arithmetic with no
  caller-visible behavior or invariant.
```

## Final evidence

Run final-mode documentation lint and search the changed scope for generic or
placeholder prose. Report legacy gaps outside the diff as baseline follow-up
instead of weakening new documentation.
