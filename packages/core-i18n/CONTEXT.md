# Localization

The Localization context defines how the platform represents language-specific
presentation without changing the identity of the underlying content.

## Language

**Locale**:
A supported language and regional presentation choice used for text and
formatting.

**Source language**:
The language of the canonical content text maintained for a Listing or other
domain record.

**Translation**:
A language-specific rendering of source content for a target Locale. A
Translation does not create a new Listing.

**Translation status**:
The state describing whether a Translation is absent, in progress, available,
or otherwise subject to editorial review.

**Language direction**:
The reading direction associated with a Locale, such as left-to-right or
right-to-left.

_Avoid_: locale as a synonym for language; translation as a new content entity;
translated text as the source of content identity.

## Boundaries

Localization changes presentation language and direction. It does not decide
publication, access, discovery eligibility, or the user's personal Library.
Translation permissions and editorial transitions belong to the [Authority and
Editorial Control context](../../apps/api/CONTEXT.md).
