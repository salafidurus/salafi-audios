# Database and Media Management

## 1. Data Ownership Model

Salafi Durus separates authoritative relational state, media storage, analytics, and client-side persistence on purpose.

### Data Categories

- **Core relational data**: scholars, listings (collections, series, and singles), publication state, and user-facing canonical state.
- **Media data**: object storage files plus relational references to those files.
- **Analytics and event data**: isolated from the authoritative core.
- **Client-side data**: cached metadata, playback continuity, and temporary local state.

## 2. Core Relational Database

- PostgreSQL is the authoritative database.
- Prisma defines schema, migrations, and typed access.
- The database stores metadata, relationships, publication state, aggregate access grants, and media references.

### Core Domain Shape

- **Scholars**: authoritative teaching source profiles (name, bio, image, social links).
- **Listings**: a single hierarchical table storing all content types — collections, series, singles, and their nested children (modules, lessons) — using self-referencing parent relations. See [nomenclature.md](../content/nomenclature.md) for the full content hierarchy definitions.
- **AudioAssets**: file URL metadata points linked directly to singles.

## 3. What the Database Must Not Store

- Audio or image blobs.
- Client-only ephemeral UI state.
- Analytics events (the Clickstream events table is fully removed from
  PostgreSQL; current client analytics are external to the database).
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

1. Client requests access to upload.
2. Backend validates scope and returns a short-lived upload grant or presigned target.
3. Client uploads directly to object storage.
4. Backend finalizes and records the media reference.

Delivery is read-heavy and CDN-oriented, but visibility and ownership rules still come from the backend.

## 6. Client-Side Persistence

Clients may persist:

- cached metadata,
- playback continuity,
- downloaded audio assets and queued personal intent,
- temporary preferences.

Client persistence improves continuity but never becomes authoritative.

## 7. Migrations and Long-Term Data Health

- Schema changes must go through Prisma migrations.
- Data ownership boundaries must remain explicit during migrations.
- Local database seeding is orchestrated via the standard `prisma db seed` command. Production catalog additions are managed through administrative API endpoints.
- If a migration changes architectural meaning, update these docs as part of the change.

## 8. Auditing, Caching, and Trigram Search

- **Audit Columns**: `createdBy`, `updatedBy`, and `deletedBy` are stored as independent, decoupled `String? @db.Uuid` columns on `Listing` and `Scholar` models to track history without strict database cascades.
- **Counter Sync**: Listings maintain denormalized `publishedLectureCount` and `publishedDurationSeconds` synchronized inside a database transaction during repository writes.
- **Trigram Search**: The database uses the PostgreSQL `pg_trgm` extension. The `Listing` model contains a GIN index on the `title` field for fuzzy searches.

## 9. Soft-Delete Tombstones for Delta Sync

- `FavoriteListing` (saved/library) carries an app-settable `updatedAt` and a `deletedAt` tombstone, the same shape as `UserListingProgress`. Unsaving sets `deletedAt`/`updatedAt` instead of deleting the row; re-saving clears `deletedAt` and bumps `updatedAt`. This lets offline clients delta-sync via `?since=` and reconcile removals — a hard delete would be invisible to a client that was offline when it happened.
- Conflict resolution on both tables is last-write-wins by `updatedAt`, applied via a raw `INSERT ... ON CONFLICT DO UPDATE ... CASE WHEN updatedAt > ...` upsert (see `AudioRepository.bulkSync` / `MyLibraryRepository.bulkSync`). Progress additionally merges `isCompleted` monotonically; My Library saved state uses plain LWW since a later unsave must be able to override an earlier save and vice versa. See [mobile.md](../clients/mobile.md#6-sync-architecture) for the client-side half of this.
- Every read path over these tables filters `deletedAt: null`.

## 10. Privacy and Hard Deletions

- GDPR compliance is backend-enforced. When a user requests hard deletion, executing `DELETE /account` cascades and purges all personal rows (`Session`, `Account`, `UserRoleAssignment`, `UserAccessGrant`, `UserListingProgress`, `FavoriteListing`) using `onDelete: Cascade` rules, while decoupled listing audit columns preserve catalog integrity. This physically removes the rows regardless of any `deletedAt` tombstone state — the soft-delete convention above is for normal unsave/sync, not a substitute for GDPR erasure.

## 11. Admin Roles and Access

- System roles (`UserRoleAssignment`) and aggregate grants (`UserAccessGrant`) are
  combined into a CASL ability server-side (`apps/api/src/core/auth/ability/ability.factory.ts`)
  and enforced per-request by `PolicyGuard`. Granting access is documented in
  [access-management.md](../administration/access-management.md) and is handled by the
  `grant:access` script, direct SQL queries, or the unified admin access API.
