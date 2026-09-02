# Content Catalog

The Content Catalog context defines the public teaching content people browse,
the scholars who provide it, and the personal My Library relationship to that
content.

## Content hierarchy

**Listing**:
Any top-level, browsable content unit. A Listing is a Collection, Series, or
Single. Modules and Lessons are nested content and are never Listings.

_Avoid_: lecture as a synonym for every content unit; series as a synonym for
every group of content.

**Collection**:
A top-level curated group of Series.

**Series**:
A top-level ordered sequence of Lectures.

**Module**:
A nested Series contained by a Collection.

**Single**:
A top-level standalone Lecture.

**Lesson**:
A Lecture nested inside a Series or Module.

**Scholar**:
The teaching source associated with a Catalog and its content.

**Topic**:
A public subject classification used to organize and discover Listings.

## Public and personal surfaces

**Catalog**:
The public surface where Listings are discovered and browsed. Explore is a
user-facing name for this surface.

_Avoid_: My Library when referring to public catalog browsing.

**My Library**:
A user's personal set of saved, in-progress, or completed relationships to
content. My Library membership does not change the public Listing.

**Continue Listening**:
A Home-only projection of an authenticated user's unfinished Progress. It is a
presentation of personal state, not a Catalog entity or an independent public
surface. It is absent while personal Progress is loading, when no unfinished
Progress exists, and after the backend accepts `completedAt`.

**Published**:
A Listing state in which the content is eligible for public discovery. It is
distinct from whether a user has saved, downloaded, or completed the content.

**Nested content**:
A Module or Lesson contained by a parent Listing and surfaced for grouping,
navigation, and progress context rather than independent discovery.

## Identity and language boundaries

**Content identity**:
The stable identity of a Listing across presentation languages and client
surfaces. A translation is not a new Listing.

**Public slug**:
The external identity used to resolve public Catalog entities. Client-facing
contracts use `listingSlug` for Listings, `topicSlug` for Topics, and
`scholarSlug` for Scholars. This applies to public and protected route
contracts, including editorial routes. An internal ID may be used after
backend resolution, but an external ID-shaped value never falls back to
internal-ID lookup.

**Public Home**:
The anonymous Catalog surface containing public promotions and discovery. It
is separate from private personal Progress and must not require a session to
load its public data.

Translation vocabulary is defined by the [Localization context](../core-i18n/CONTEXT.md).
