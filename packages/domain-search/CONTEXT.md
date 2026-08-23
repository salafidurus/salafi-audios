# Discovery

The Discovery context defines how a person expresses an interest in public
content and how the Catalog answers that interest.

## Language

**Discovery**:
The act of finding relevant published Listings through search, browse, feed, or
topic navigation.

**Query**:
The person's expressed discovery text or criteria.

**Search result**:
A published Catalog item returned because it matches a Query or discovery
criterion. A result is not a new content entity.

**Filter**:
A narrowing criterion applied to discovery results, such as a Topic or Scholar.

**Browse**:
Discovery without a free-text Query, using an ordered public collection of
Listings or a classification such as Topic.

**Feed**:
An ordered discovery surface that presents eligible public content according to
its own curation or recency rule.

**Discovery feed**:
The Explore feed: a cursor-paginated, mixed surface of Listing items and
branching discovery modules. Its composition is authoritative in the API and
may be steered by a Topic without becoming a strict result filter.

**Topic steering**:
A user's selected Topic preference for the discovery feed. It increases the
share of related content while preserving a smaller amount of adjacent and
serendipitous discovery.

**Discovery module**:
A non-listing branch in the discovery feed, such as a Scholar row or a Topic
row. Modules are recommendations, not Catalog entities or search results.

**Explored**:
Content already displayed during the current discovery session. It is not a
synonym for opened, listened to, saved, or completed.

_Avoid_: feed as a synonym for the Catalog; search result as a synonym for a
Listing.

## Boundaries

Discovery can expose only content that the Content Catalog makes publicly
eligible. It does not publish content, grant access, or change a user's Library.

The [Content Catalog context](../domain-content/CONTEXT.md) owns Listing,
Scholar, and Topic meaning. Discovery consumes those concepts and adds only the
language of finding them.
