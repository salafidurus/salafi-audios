# Content Nomenclature

This document is the canonical vocabulary for the Salafi Durus content hierarchy.
Use these terms in code, DTOs, UI copy, and AI/developer instructions. They exist
to remove a long-standing ambiguity: the words "lecture" and "series" used to name
_both_ a structural shape and a top-level browsable unit at once.

## Two axes

Every piece of content is described by two independent axes.

**Axis 1 — Format** (its structural shape; these are the DB primitives, never renamed):

- **Lecture** — a single audio talk (the atomic, playable unit).
- **Series** — an ordered sequence of lectures.
- **Collection** — a curated group of series.

**Axis 2 — Placement** (where it sits in the hierarchy):

- **Top-level** — directly discoverable via search / feed / a scholar's Catalog.
- **Nested** — contained inside a parent; surfaced only for grouping, aesthetics,
  and progress tracking, never as a discovery entry point.

## The five names

Each (primitive × placement) cell has exactly one name:

| DB primitive | Condition              | Name           | Top-level?                     |
| :----------- | :--------------------- | :------------- | :----------------------------- |
| `Collection` | always root            | **Collection** | yes                            |
| `Series`     | `collectionId == null` | **Series**     | yes                            |
| `Series`     | `collectionId != null` | **Module**     | no (nested in a Collection)    |
| `Lecture`    | `seriesId == null`     | **Single**     | yes                            |
| `Lecture`    | `seriesId != null`     | **Lesson**     | no (nested in a Series/Module) |

Because of this, "lecture" and "series" are no longer overloaded: a standalone
lecture is a **Single**, a lecture inside a series is a **Lesson**; a standalone
series is a **Series**, a series inside a collection is a **Module**.

## Listing — the umbrella term

A **Listing** is any top-level, browsable content unit, regardless of format. The
three Listing formats are exactly **Collection**, **Series**, and **Single**
(`ListingFormat = "collection" | "series" | "single"`, defined in
`@sd/core-contracts`). **Module** and **Lesson** are never Listings.

- **Dev-facing:** the type `Listing` / `ListingFormat`; surfaces such as search,
  feed, and `getContent` return Listings.
- **User-facing:** the place where Listings are browsed is the **Catalog**
  (a.k.a. "Explore"). Note: "My Library" is a _different_ surface — the user's saved
  / in-progress / completed items — and must not be reused for the Catalog.

## How the model maps to storage

The content hierarchy is stored in a single `Listing` table using a self-referencing
composite foreign key `(parentId, scholarId)` pointing to `Listing(id, scholarId)`.
This guarantees at the engine level that child modules/lessons share the parent's
scholar.

The `format` enum field (`collection`, `series`, `single`) defines the structural
format. A Single is a Listing record of format `single` containing audio assets,
while Lessons and Modules are nested children of format `single` and `series`
respectively.

To optimize querying, Listing records store a denormalized `title` and `description`
containing the primary source text (e.g., Arabic), whereas `ListingTranslation`
contains secondary localized translations (e.g., English). Slugs are globally unique
(`slug String @unique`) and are the public identity used for clean URL lookups at
`/listings/:slug` by both web and mobile applications. Client-facing contracts use
`listingSlug`, `topicSlug`, and `scholarSlug`; after resolving those values, the API
may use internal database IDs for relational queries. An ID-shaped public value never
falls back to an internal-ID lookup. Parent listings use `onDelete: Restrict` on child
relations to prevent accidental orphans.

## Home and personal listening vocabulary

**Public Home** is the anonymous Catalog surface for promotions and discovery. It is
separate from private personal state.

**Continue Listening** is a Home-only projection of authenticated unfinished Progress.
It is not a Catalog entity, is absent while personal Progress is loading or empty, and
disappears when `completedAt` is accepted.

## Engineering vocabulary

### Analytics vocabulary

**Product event**:
An immutable observation, interaction, exposure, or confirmed product outcome
with event-time context. It is distinct from operational logs, metrics, and
traces.

**Canonical event**:
The provider-neutral product-event value owned by the application. A sink may
translate it, but a vendor does not define its meaning.

**Event authority**:
The declared source of truth for an event: client observation for what a
runtime observed or initiated, or backend-confirmed for an authorized and
persisted domain outcome.

**Exposure event**:
A product event recording content or a recommendation that was shown, with
the context needed to interpret position and candidate selection.

**Anonymous identity**:
A resettable pseudonymous identifier used only for permitted non-sensitive
product telemetry. It is not an authenticated account identity.

**Owned event archive**:
The application-controlled append-only history of canonical product events.
It is separate from the transactional PostgreSQL database and analytics sinks.

**Analytics sink**:
A downstream adapter such as Mixpanel that receives canonical events for
analysis. A sink is not the permanent source of truth.

**Integration outbox**:
A short-lived delivery mechanism for reliably forwarding selected
backend-confirmed events after a transaction; it is not a permanent clickstream
store.

### Native rendering vocabulary

- **Universal UI** means a common component imported from the universal
  `@expo/ui` API.
- **Platform UI** means a SwiftUI or Jetpack Compose Expo UI component selected
  because the required behavior materially differs by platform.
- **RN fallback UI** means React Native visual UI retained for a documented
  capability, performance, accessibility, or infrastructure gap.
- **Bridge** means an explicit boundary between an Expo UI/platform-native
  subtree and a React Native subtree. `RNHostView` places the React Native
  child inside Expo UI; it is not a generic layout wrapper.
- **Native UI primitive** means a reusable semantic component that owns product
  behavior and design-token mapping while delegating rendering to Universal UI,
  Platform UI, or an approved RN fallback.

**Complexity budget** is the maximum cyclomatic complexity permitted for an
in-scope production function. The repository currently sets that budget to 7
and measures it with Oxlint's `eslint/complexity` rule using the `modified`
variant. It is a control-flow maintainability measure, not a synonym for file
size, naming quality, or general readability. A lower budget may be adopted
only when behavior-preserving decomposition remains clear.

## Dead-code governance vocabulary

**Reachable code** is executable code connected through accepted static or
dynamic edges to a declared runtime, build, route, job, CLI, package, or test
root.

**Orphan code** is executable code with no confirmed path from an accepted root.

**Dead test** is a test that does not observe behavior, protect a supported
contract, or provide meaningful regression evidence.

**Confirmed dead** is an orphan or dead test whose removal has been checked
against runtime roots, dynamic mechanisms, external-consumer policy, and
verification results.
