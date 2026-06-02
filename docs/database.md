# Database and Media Management

## 1. Data Ownership Model

Salafi Durus separates authoritative relational state, media storage, analytics, and client-side persistence on purpose.

### Data Categories

- **Core relational data**: scholars, collections, series, lectures, publication state, and user-facing canonical state.
- **Media data**: object storage files plus relational references to those files.
- **Analytics and event data**: isolated from the authoritative core.
- **Client-side data**: cached metadata, playback continuity, and temporary local state.

## 2. Core Relational Database

- PostgreSQL is the authoritative database.
- Prisma defines schema, migrations, and typed access.
- The database stores metadata, relationships, publication state, permissions-related data, and media references.

### Core Domain Shape

- **Scholars**: authoritative teaching source.
- **Collections**: curated groupings.
- **Series**: ordered teaching groups within or outside collections.
- **Lectures**: individual media-backed lessons with metadata.

## 3. What the Database Must Not Store

- Audio or image blobs.
- Client-only ephemeral UI state.
- Analytics as part of canonical relational truth.
- Secrets or infrastructure credentials.

These are structural rules, not optimization suggestions.

## 4. Media Ownership and References

Media is stored outside PostgreSQL, but its references are managed authoritatively through relational records.

### Rules

- Store keys, URLs, and metadata references in the database.
- Store the actual binary assets in object storage.
- Treat replacement as an explicit editorial action rather than an in-place silent overwrite.

## 5. Upload and Delivery Model

Uploads use a backend-authorized direct-to-storage flow:

1. Client requests permission to upload.
2. Backend validates scope and returns a short-lived upload grant or presigned target.
3. Client uploads directly to object storage.
4. Backend finalizes and records the media reference.

Delivery is read-heavy and CDN-oriented, but visibility and ownership rules still come from the backend.

## 6. Client-Side Persistence

Clients may persist:

- cached metadata,
- playback continuity,
- planned offline assets and queued intent,
- temporary preferences.

Client persistence improves continuity but never becomes authoritative.

## 7. Migrations and Long-Term Data Health

- Schema changes must go through Prisma migrations.
- Data ownership boundaries must remain explicit during migrations.
- Backfills and content-ingestion workflows must preserve canonical relationships and publication rules.
- If a migration changes architectural meaning, update these docs as part of the change.
