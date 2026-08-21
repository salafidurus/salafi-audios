# Content Catalog

The Content Catalog context defines the public teaching content people browse,
the scholars who provide it, and the personal Library relationship to that
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

_Avoid_: Library when referring to public catalog browsing.

**Library**:
A user's personal set of saved, in-progress, or completed relationships to
content. Library membership does not change the public Listing.

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
The only external identifier used to resolve a Listing. This applies to public
and protected route contracts, including editorial routes. An internal ID may
be used after backend resolution, but an external ID-shaped value never falls
back to internal-ID lookup.

Translation vocabulary is defined by the [Localization context](../core-i18n/CONTEXT.md).
