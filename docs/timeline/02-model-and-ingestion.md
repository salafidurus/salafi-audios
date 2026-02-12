# Phase 02 — Domain Model, Collections, and Ingestion

## Purpose of This Phase

This phase establishes the **canonical content model** of Salafi Durus and a **structured ingestion path** to populate it.

Instead of building admin UX or ad-hoc data entry, this phase introduces:

- A relational domain model for scholars, collections, series, and lectures
- A dedicated model for audio assets
- A repeatable ingestion pipeline that creates **real, published content** for use in later phases

This unlocks realistic testing for the catalog, playback, and offline behavior without prematurely building admin features.

---

## Outcomes (Definition of Done)

This phase is complete when:

- The database schema is migrated to include:
  - `Scholar`, `Collection`, `Series`, `Lecture`
  - `AudioAsset`
  - Topics and join tables (optional but wired)
  - Progress and favorites tables (even if not used yet)
- A **structured ingestion pipeline** exists that can:
  - Read content definitions from files (YAML/JSON or similar)
  - Upload audio files to storage (R2) and create `AudioAsset` records
  - Create or update scholars, collections, series, and lectures
  - Set correct publication state and ordering
- Dev and preview environments can be populated with:
  - A small, realistic content set (multiple scholars/collections/series/lectures)
- Only **published** lectures surface through public-facing read APIs (even if those APIs are still minimal).

No admin UI or human-facing editorial tooling exists yet.

---

## Scope

### Included

- Core relational schema for:
  - `User`, `UserGlobalRole`, `UserScholarRole`
  - `Scholar`
  - `Collection`
  - `Series`
  - `Lecture`
  - `AudioAsset`
  - `Topic` + `LectureTopic` / `SeriesTopic` / `CollectionTopic`
  - `UserLectureProgress`
  - `FavoriteLecture`
- Migrations and Prisma client generation (`packages/db`)
- Backend “domain services” for creating/updating:
  - Scholars
  - Collections
  - Series
  - Lectures (with ordering + publication state)
  - Audio assets
- Ingestion tooling:
  - Content definition format (YAML/JSON)
  - CLI or script to ingest or upsert the data
  - Integration with the media pipeline (upload audio to R2, create `AudioAsset`)
- Basic read-only backend queries to:
  - Fetch scholars, collections, series, lectures
  - Respect `Status` and soft-delete constraints

### Explicitly Excluded

- Admin or editor UI
- Authentication flows for real users
- Favorites UX
- Playback and progress APIs
- Offline behavior
- Analytics

Those appear in later phases once the domain is stable and populated.

---

## Domain Modeling Responsibilities

The backend must reflect the schema and relationships you’ve defined:

### Scholars

- `Scholar` captures:
  - Identity and metadata (name, bio, image, language, country)
  - Active/inactive state (`isActive`)
- Relations:
  - `Scholar` → many `Collection`
  - `Scholar` → many `Series` (standalone or within collections)
  - `Scholar` → many `Lecture` (standalone or via series)
- Constraints:
  - Unique `slug` per scholar
  - Indexed `isActive` for filtering

### Collections

Collections are **large containers** that group series for a scholar.

- `Collection` fields:
  - `scholarId`
  - `slug`
  - `title`, `description`
  - `coverImageUrl`, `language`
  - `status: Status` (`draft`, `review`, `published`, `archived`)
  - `orderIndex` (ordering within a scholar)
  - Soft-delete: `deletedAt`, `deleteAfterAt`
- Relations:
  - `Collection` → `Scholar`
  - `Collection` → many `Series`
  - `Collection` ↔ `Topic` via `CollectionTopic`
- Constraints:
  - `@@unique([scholarId, slug])`
  - Indexed by `status`, `orderIndex`, soft-delete fields

### Series

Series can belong to a collection or be standalone.

- `Series` fields:
  - `scholarId`
  - `collectionId?` (nullable)
  - `slug`, `title`, `description`
  - `coverImageUrl`, `language`
  - `status: Status`
  - `orderIndex` (ordering within a collection)
  - Soft-delete: `deletedAt`, `deleteAfterAt`
- Relations:
  - `Series` → `Scholar`
  - `Series` → optional `Collection`
  - `Series` → many `Lecture`
  - `Series` ↔ `Topic` via `SeriesTopic`
- Constraints:
  - `@@unique([scholarId, slug])`
  - Indexed by `collectionId + orderIndex`, `status`, soft-delete fields

### Lectures

Lectures are the **playable units**.

- `Lecture` fields:
  - `scholarId`
  - `seriesId?` (nullable, for standalone lectures)
  - `slug`, `title`, `description`
  - `language`
  - `status: Status`
  - `publishedAt` (when status became `published`)
  - `orderIndex` (ordering within series)
  - `durationSeconds?`
  - Soft-delete: `deletedAt`, `deleteAfterAt`
- Relations:
  - `Lecture` → `Scholar`
  - `Lecture` → optional `Series`
  - `Lecture` → many `AudioAsset`
  - `Lecture` ↔ `Topic` via `LectureTopic`
  - `Lecture` ↔ `UserLectureProgress`, `FavoriteLecture`
- Constraints:
  - `@@unique([scholarId, slug])`
  - Indexed by `seriesId + orderIndex`, `status`, `publishedAt`, soft-delete

### Audio Assets

Audio assets model the actual media variants for a lecture.

- `AudioAsset` fields:
  - `lectureId`
  - `url` (storage or delivery URL or key)
  - `format?` (e.g. mp3, m4a)
  - `bitrateKbps?`
  - `sizeBytes?`
  - `durationSeconds?`
  - `source?` (e.g. “r2”, “legacy-import”)
  - `isPrimary` (single primary asset per lecture)
  - `createdAt`
- Relations:
  - `AudioAsset` → `Lecture` (onDelete: Cascade)
- Constraints:
  - Index on `lectureId`
  - Partial unique index for `isPrimary = true` per lecture (via raw SQL migration)

This model supports multiple audio variants but enforces a single primary for playback.

---

## Ingestion Responsibilities

Ingestion is the only way content enters the system in this phase.

### Content Definition Format

Define a structured, versioned format (YAML/JSON) that supports:

- Scholars (slug, name, metadata)
- Collections under each scholar (slug, title, order, status, topics)
- Series under each scholar/collection (slug, title, order, status, topics)
- Lectures under each series (or directly under scholar):
  - `slug`, `title`, `description`, `language`
  - `status` (`draft`, `review`, `published`, `archived`)
  - `orderIndex`
  - `publishedAt` (optional; can be derived)
  - `durationSeconds` (optional)
  - `audioFile` (path to local audio asset to ingest)
  - Topics

The format must be **validated** before writing anything to the database.

### Ingestion Pipeline

Implement a CLI or script (e.g. `pnpm ingest:content`) which:

1. Reads and validates content files.
2. Upserts:
   - Scholars by `slug`
   - Collections by `(scholarId, slug)`
   - Series by `(scholarId, slug)` with optional `collectionId`
   - Lectures by `(scholarId, slug)` with optional `seriesId`
3. For each lecture with an `audioFile`:
   - Uploads audio to R2 (using the media upload helpers)
   - Creates an `AudioAsset` row
   - Marks **exactly one** asset as primary
4. Sets `Status` and `publishedAt` correctly.

### Idempotency and Safety

The ingestion pipeline must be:

- **Idempotent**:
  - Re-running ingestion does not create duplicate rows.
  - Updates metadata and relationships in place.
- **Deterministic**:
  - Ordering in collections/series/lectures is predictable and stored.
- **Environment-aware**:
  - Dev/preview can be freely re-ingested.
  - Production ingestion is explicit and controlled.

No ingestion code is exposed as public API.

---

## Media / Audio Responsibilities

Even though full admin workflows arrive later, this phase must define:

- Canonical way to generate `url` (or underlying storage key) for `AudioAsset`
- Clear separation between:
  - **Upload/storage concerns** (R2)
  - **Delivery concerns** (playback URLs, CDN)
- A stable abstraction used later by:
  - Playback APIs
  - Admin upload/replace flows
  - Offline/download logic

For now, ingestion may upload directly using infrastructure scripts or helpers that talk to R2. The important part is that `AudioAsset` rows are created in the same shape admin uploads will use later.

---

## Environment Expectations

By the end of this phase:

- **Development**:
  - Has at least one scholar with collections, series, and lectures
  - Lectures have `AudioAsset` rows and valid URLs that can be hit in dev
- **Preview**:
  - Uses the same ingestion pipeline to create realistic demo data
- **Production**:
  - May be empty or partially ingested, but **only via ingestion**, not manual DB edits

All later phases (catalog, playback, offline) assume this structure and ingestion path.

---

## Non-Goals of This Phase

Do **not** implement:

- Any admin/editor UI
- Authentication or user roles in the product
- Playback components
- Favorites UX
- Offline progress or downloads
- Analytics or event tracking

Those belong in later phases once the core content model is stable and populated.

---

## Exit Criteria Checklist

Before moving to the Read-Only Catalog phase, confirm:

- [ ] Schema is migrated and Prisma client builds successfully
- [ ] Scholars, collections, series, lectures, and audio assets exist in the DB
- [ ] Ingestion pipeline can populate dev and preview reliably
- [ ] Only `published` lectures (with non-deleted ancestors) are exposed by read queries
- [ ] Ordering within collections and series is deterministic
- [ ] Audio assets are correctly associated and have a single primary per lecture
- [ ] No ad-hoc or manual DB edits are required to add content

Once this checklist is complete, the platform is ready to build real catalog and playback experiences on a solid, populated domain model.
