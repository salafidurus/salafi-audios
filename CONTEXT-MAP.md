# Context Map

Salafi Durus is a listening and discovery platform. Its business model is split
between public content, personal listening state, identity and access, and the
editorial authority that governs durable changes. Web and native are clients of
these contexts; they do not own business authority.

## Contexts

- [Content Catalog](./packages/domain-content/CONTEXT.md): defines the browsable
  content hierarchy, scholars, topics, publication visibility, and the user's
  Library relationship to content.
- [Discovery](./packages/domain-search/CONTEXT.md): defines how people express
  discovery intent and how public catalog content becomes searchable results.
- [Listening](./packages/domain-audio/CONTEXT.md): defines playable media,
  listening sessions, queues, playback continuity, and completion.
- [Personal State and Synchronization](./packages/core-sync/CONTEXT.md): defines
  personal intent, local reconciliation, tombstones, and cross-device state.
- [Account](./packages/domain-account/CONTEXT.md): defines the person using the
  service, their account identity, and their authenticated session.
- [Authority and Editorial Control](./apps/api/CONTEXT.md): defines the backend
  authority, policy decisions, access scope, and editorial state transitions.
- [Localization](./packages/core-i18n/CONTEXT.md): defines locales, source and
  translated content, translation status, and language direction.

## Relationships

- **Content Catalog → Discovery**: public, published Listings become discoverable
  through search and browse surfaces.
- **Content Catalog → Listening**: playable Singles and Lessons reference audio
  that can be resolved into Tracks.
- **Content Catalog → Personal State and Synchronization**: a user may save a
  Listing or record listening Progress without changing catalog authority.
- **Listening → Personal State and Synchronization**: playback produces personal
  progress intent; reconciliation may update the durable personal record.
- **Account → Personal State and Synchronization**: personal state is scoped to a
  User and must not leak across account changes.
- **Account → Authority and Editorial Control**: Identity establishes who is
  acting; Authority decides what that User may do.
- **Localization → Content Catalog**: translated titles and descriptions refine
  the presentation of a Listing without changing its content identity or slug.
- **Authority and Editorial Control → every context**: the API is the authority
  for protected actions, publication visibility, and conflict resolution.

## Boundary rules

- A **Listing** is public catalog content; a **Library item** is a personal
  relationship to a Listing. Do not use either term as a synonym for the other.
- **Authentication** identifies a User; **authorization** decides whether an
  action is allowed. Client checks are convenience only.
- **Progress** is personal listening state; **Completion** is a progress outcome,
  not a publication state.
- **Download** means device-local media availability. It is not a Listing state,
  a permission, or proof of Completion.
- **Translation** changes language presentation; it does not create a new
  Listing or change the source-language identity of its content.
