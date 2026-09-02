# TSDoc implementation policy

Write TSDoc from the implementation and its tests. Preserve the behavior a
caller needs to understand; do not mechanically narrate the syntax below it.

## Required coverage

Document exported production functions, classes, hooks, components, types, and
interfaces; meaningful semantic fields; and non-obvious private helpers whose
invariants or side effects are easy to break. Do not add prose to trivial locals
or obvious JSX merely to increase coverage.

## Useful examples

Weak documentation repeats the declaration name:

```ts
/** Fetches the listing. */
export function fetchListing(slug: string) {}
```

Useful documentation explains identity, result shape, authority, and failure:

```ts
/**
 * Loads the public listing identified by its canonical slug.
 *
 * Returns the ordered content tree. Publication visibility remains
 * server-authoritative; an unknown or unavailable slug rejects.
 */
export function fetchListing(slug: string) {}
```

Document state invariants:

```ts
/**
 * Tracks editing, transfer, and commit phases for the arrange workflow.
 * Upload failures return the workflow to `editing`; server slug conflicts
 * remain in `conflictSlugs` so the user can correct and retry.
 */
type UploadArrangePhase = "editing" | "uploading" | "committing" | "done";
```

Document why semantic fields matter:

```ts
/** Prevents filename-derived slugs from replacing an explicit user edit. */
slugEdited: boolean;
```

Document adapter boundaries:

```ts
/**
 * Adapts the browser media element to the domain playback contract.
 * Setup is a no-op outside the browser; playback failures are reported
 * through engine callbacks rather than thrown from UI event handlers.
 */
class HTMLAudioAdapter {}
```

Intentional omission is correct for a local with no caller-visible contract:

```ts
const nextIndex = currentIndex + 1;
```

Never use `Documents the intent and contract` or similar generated text.

## Quality checks

Before committing a slice, compare comments with the implementation and tests,
replace stale or duplicated prose, run final-mode TSDoc lint, and confirm the
documentation and tests describe the same behavior.
