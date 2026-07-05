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
  (a.k.a. "Explore"). Note: "Library" is a _different_ surface — the user's saved
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
(`slug String @unique`) to allow clean URL lookups at `/listings/:slug` for both web
and mobile applications. Parent listings use `onDelete: Restrict` on child relations
to prevent accidental orphans.
