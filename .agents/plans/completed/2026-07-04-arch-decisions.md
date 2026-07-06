# Architectural Decisions: Backend and Client Restructuring (2026-07-04)

This document records the official architectural decisions synthesized from the reviews of **AGY**, **Opencode**, and **Copilot**, incorporating final user choices on slug resolution, text denormalization, and domain packaging.

---

## 1. Summary of Decisions

1. **Unification of Content Models:** Collapse `Collection`, `Series`, and `Lecture` (and their respective translation/topic models) into a single, hierarchical `Listing` model in PostgreSQL.
2. **Parent-Child Deletion Rule:** Implement `onDelete: Restrict` on recursive parent relations in the `Listing` model. This prevents deleting a parent listing (such as a Series or Collection) if it contains active children, requiring editors to delete or clean up children first.
3. **Text Denormalization:** Keep `title` and `description` directly on the base `Listing` table to store the default source language (e.g., Arabic). Use `ListingTranslation` only for secondary localized translations (e.g., English). This avoids SQL JOIN operations for default catalog views.
4. **Globally Unique Slugs:** Enforce a global uniqueness constraint on `slug` (`@@unique([slug])`) on the `Listing` model. Both Next.js web and Expo mobile applications utilize the unique `slug` for dynamic page loading and layout routing.
5. **Detail Endpoint Resolution:** Expose a single canonical lookup endpoint `GET /listings/:slug` for fetching listing records on both client platforms. The UUID lookup is restricted to administrative and background sync routes.
6. **Soft-Delete Strategy:** Standardize on `deletedAt` only. Defer all scheduled hard-deletion and lifecycle cleanup logic to NestJS application-level tasks. Do not carry `deleteAfterAt` in the DB.
7. **User Access Roles:** Establish a generic, hierarchical `UserRole` enum (`user`, `admin`, `editor`, `superadmin`) for standard Role-Based Access Control (RBAC).
8. **Permissions Resource Mapping:** Re-nest admin permissions endpoints under the User resource space at `/admin/users/:userId/permissions`.
9. **Analytics Database Partitioning:** Remove the clickstream `AnalyticsEvent` table from the transactional PostgreSQL database completely. Defer all analytics logging until a dedicated ClickHouse or PostHog pipeline is established.
10. **Audit Fields Structure:** Establish audit fields (`createdBy`, `updatedBy`, `deletedBy`) on `Listing` and `Scholar` models as decoupled UUID string columns (`String? @db.Uuid`) without strict foreign key relations to the `User` table. This prevents user deletion cascades from affecting listing/scholar records.
11. **User Account Hard-Deletion (GDPR/Privacy):** Expose a self-service `DELETE /account` route (and admin `DELETE /admin/users/:userId`) to permanently hard-delete a user profile from PostgreSQL. Standardize relations (`Session`, `Account`, `AdminPermission`, `UserListingProgress`, `FavoriteListing`) to use `onDelete: Cascade` on the `User` model, ensuring all personal records are immediately and irreversibly purged. Decoupled audit columns on `Listing` and `Scholar` ensure the public content catalog remains completely intact.
12. **Denormalized Counter Synchronization:** Use an application-level transactional helper in `ListingsRepository` to recalculate parent listing aggregates (`publishedLectureCount` and `publishedDurationSeconds`) whenever a child listing is inserted, updated (status changes), or soft-deleted.
13. **Permissions Return Shape Standardization:** Standardize both `getMyPermissions()` and `getPermissions(userId)` endpoints to return a unified, simple array of string permission names (`string[]`).
14. **Permissions Mutation Return Shape:** Standardize both `grant()` and `revoke()` endpoints to return the updated list of user permission string names (`string[]`) after executing mutations, simplifying client-side caching.
15. **Zod-Based Authoritative Contracts:** Define **all** data transfer object (DTO) contracts in `@sd/core-contracts` using Zod schemas. Replace legacy raw TypeScript interface declarations with schemas (e.g. `scholarDetailSchema = z.object(...)`), inferring the TypeScript type definitions authoritatively via `z.infer`. This guarantees validation rules and type constraints cannot drift.
16. **Deep Zod Integration in NestJS:** Replace standard `class-validator` and `class-transformer` validation decorators with `nestjs-zod` global validation pipes. Define core Zod schemas in `@sd/core-contracts` to share validation logic between backend validation pipelines, Next.js web forms, and mobile offline engines. Wrap contract schemas in NestJS classes using `createZodDto` to retain full compatibility with controller dependency injection and Swagger/OpenAPI documentation generation.
17. **Removal of Ingestion Utility:** Fully deprecate and delete the custom file-based CLI ingestion package (`packages/util-ingest`). Local seeding is replaced by a standard Prisma seeder script, and production catalog additions are transitioned to administrative REST API endpoints.
18. **Staged, Checkpointed Tasks:** Split the code migration into logically isolated stages (Hygiene/Seed, Schema Unification, Contracts, Domain Packages, Backend Modules, Web, Mobile, Fine-Tuning) to reduce merge conflict windows and enable intermediate verify checkpoints.

---

## 2. Core Decisions & Rationale

### Decision 1: Database Model Selection for Catalog Content

- **Decision:** Consolidate `Collection`, `Series`, and `Lecture` tables into a single self-referencing `Listing` table using a `format` discriminator enum (`collection | series | single`) and a recursive `parentId` relationship.
- **Deletion Rule:** Implement `onDelete: Restrict` on Listing parent relations. This ensures child lectures or series are never orphaned accidentally, enforcing a strict manual review of listing contents before removal.
- **Rationale:** Merging the models eliminates schema duplication and redundant query scripts. It achieves 100% DRY tables. A composite foreign key `(parentId, scholarId) -> Listing(id, scholarId)` enforces scholar-child consistency directly at the database engine level, preventing mismatches (e.g., a Lesson belonging to a different Scholar than its parent Series).

### Decision 2: Text Denormalization vs. Pure Translation Joins

- **Decision:** Keep `title` and `description` directly on the base `Listing` table for the primary source language, and use `ListingTranslation` side-tables only for secondary translations.
- **Rationale:** Pure structural base tables force every query (feeds, searches, lists) to perform a SQL JOIN to retrieve a title, causing performance degradation. Denormalizing the default language text allows fast, direct reads while retaining full translation support.
- **Superseded:** Rejects pure structural tables (AGY's initial proposal).

### Decision 3: Slug Uniqueness & Route Resolution

- **Decision:** Enforce globally unique slugs via `slug String @unique` on the `Listing` model. Both mobile and web clients query listings by their slug.
- **Rationale:** Having mobile and web share the same lookup parameters unifies query caches and simplifies client deep linking. A global uniqueness constraint allows short public URLs at `/listings/:slug` and avoids nesting under scholar parameters.
- **Superseded:** Rejects scholar-only uniqueness constraints (Opencode's suggestion).

### Decision 4: Translation Schema Pattern

- **Decision:** Retain strongly typed translation side-tables (`ListingTranslation` and `ScholarTranslation`) linked to parent models via standard foreign keys with `ON DELETE CASCADE` directives.
- **Rationale:** While a single polymorphic translation table (proposed by Opencode) reduces schema boilerplate, it prevents database-level foreign key validation and cascade purges, leaving the database vulnerable to orphaned translation rows. Separated side-tables provide compile-time type safety and native PostgreSQL database integrity.
- **Superseded:** Rejects the consolidated polymorphic `ContentTranslation` table (Opencode).

### Decision 5: Soft-Delete Column Strategy

- **Decision:** Standardize all tables on a simple nullable `deletedAt DateTime?` timestamp.
- **Rationale:** Standardizing on a single field keeps queries simple and indexes clean. All scheduled hard-deletions or cron-based purges are managed at the NestJS application layer, avoiding table bloat and double-timestamp indexes.
- **Superseded:** Rejects maintaining `deleteAfterAt` in database columns (AGY's initial proposal).

### Decision 6: User Roles and Permission Mappings

- **Decision:** Establish a generic, hierarchical `UserRole` enum (`user`, `admin`, `editor`, `superadmin`) for role-based access control (RBAC).
- **Rationale:** Generic roles are highly extensible, standard across authorization libraries, and decouple user profile access states from active content schemas.
- **Superseded:** Rejects domain-specific roles like `scholar_editor` (AGY's initial proposal).

### Decision 7: Audit Fields Structure

- **Decision:** Keep `createdBy`, `updatedBy`, and `deletedBy` as independent `String? @db.Uuid` columns.
- **Rationale:** Direct relations would require user deletions to nullify keys or cascade deletes. Decoupling them as UUID string columns records history without schema-level cascades or lockups.

### Decision 8: User Account Hard-Deletion & Catalog Protection

- **Decision:** Configure `onDelete: Cascade` on the `User` model relation for personal data tables (`Session`, `Account`, `AdminPermission`, `UserListingProgress`, `FavoriteListing`), and support hard account deletions via `DELETE /account`. Keep audit UUID strings historical on `Listing` and `Scholar` records.
- **Rationale:** GDPR/privacy regulations require complete, irreversible purging of user accounts and progress logs upon request. Setting up cascade deletion ensures one database transaction purges all user data cleanly, while decoupled audit UUIDs prevent public catalog structures from breaking or deleting.

### Decision 9: Denormalized Counter Synchronization

- **Decision:** Perform parent listings counter recalculation (`publishedLectureCount` and `publishedDurationSeconds`) dynamically in transactions inside `ListingsRepository`.
- **Rationale:** Database-level triggers are difficult to manage and test within Prisma migrations. Compute-on-query is too slow for feed indexing. An repository-level transaction maintains accurate counts on mutation routes safely.

### Decision 10: Permissions Return Shape Standardization

- **Decision:** Standardize all permissions read and write endpoints to return `string[]`.
- **Rationale:** Legacy methods returned database schemas for `getPermissions` and string arrays for `getMyPermissions`, complicating frontend stores. Returning string arrays unifies state checking.

### Decision 11: Zod-Based Authoritative DTO Contracts

- **Decision:** Re-write all contract files inside `packages/core-contracts` to declare Zod validation schemas.
- **Rationale:** Declaring raw TypeScript types allows DTO structures to drift from database validation and does not support runtime verification. Defining Zod schemas for all responses (details, feeds, lists, search, library, home suggestions) and using type inference (`z.infer`) enforces schema discipline across all packages.

### Decision 12: NestJS Zod Integration

- **Decision:** Modernize NestJS validation using `nestjs-zod` global validation pipes and inferred DTO classes.
- **Rationale:** Standard `class-validator` decorators force double-maintenance of type definitions and fail to bundle cleanly in mobile client environments. Sharing validation schemas via Zod in `@sd/core-contracts` guarantees backend-frontend sync, eliminates decorator compile blocks, and ensures clean integration with NestJS Dependency Injection and Swagger OpenAPI generators via the `createZodDto` class wrapper.

### Decision 13: Seeding and Ingestion Architecture

- **Decision:** Completely delete the custom CLI ingestion package (`packages/util-ingest`). Local seeding is managed via the standard `prisma/seed.ts` script, and production catalog additions are transitioned to NestJS administrative REST API endpoints.
- **Rationale:** Maintaining a custom CLI tool that duplicates schema validation, executes complex transaction rollbacks, and uploads raw assets creates high technical debt. Replacing it with standard Prisma seeding for development and web-based dashboard APIs for editors streamlines the backend.
- **Superseded:** Rejects refactoring/preserving `packages/util-ingest` (AGY/Opencode initial plans).

### Decision 14: Clickstream Analytics Database Strategy

- **Decision:** Remove the `AnalyticsEvent` clickstream table from the transactional PostgreSQL database completely.
- **Rationale:** High-frequency clickstream and playback telemetry degrade the performance of transactional OLTP databases. Clickstream events are deferred until a dedicated pipeline (like PostHog or ClickHouse) is deployed.
- **Superseded:** Rejects keeping or cleaning up `AnalyticsEvent` inside PostgreSQL (Copilot's plan).

### Decision 15: Execution and Rollout Sequence

- **Decision:** Split the migration into logically isolated, checkpointed stages (Hygiene/Seed, Schema Unification, Contracts, Domain Packages, Backend Modules, Web, Mobile, Fine-Tuning) to reduce merge conflict windows and enable intermediate verify checkpoints.
- **Rationale:** Staged tasks reduce merge conflict windows with active feature branches (such as `feat/web-ui-redesign`), allow targeted code reviews, and provide independent verify checkpoints.
- **Superseded:** Rejects monolithic branch deployments (AGY's initial proposal).

---

## 3. Updates to Authoritative Documentation in `docs/`

The following modifications must be applied to the Markdown files in the `docs/` directory to reflect the new architecture.

_(Note: [dev-ops.md](file:///C:/dev/salafi-audios/docs/dev-ops.md) and [prd.md](file:///C:/dev/salafi-audios/docs/prd.md) were audited and require no updates since they do not contain references to the custom ingestion utility or the clickstream analytics tables.)_

### A. Updates to [nomenclature.md](file:///C:/dev/salafi-audios/docs/nomenclature.md)

- **Change:** Replace "How the model maps to storage" (L53-60) to describe the unified schema and parent composite restrict constraints.
- **Revised Content:**

  ```markdown
  ## How the model maps to storage

  The content hierarchy is stored in a single `Listing` table using a self-referencing composite foreign key `(parentId, scholarId)` pointing to `Listing(id, scholarId)`. This guarantees at the engine level that child modules/lessons share the parent's scholar.

  The `format` enum field (`collection`, `series`, `single`) defines the structural format. A Single is a Listing record of format `single` containing audio assets, while Lessons and Modules are nested children of format `single` and `series` respectively.

  To optimize querying, Listing records store a denormalized `title` and `description` containing the primary source text (e.g., Arabic), whereas `ListingTranslation` contains secondary localized translations (e.g., English). Slugs are globally unique (`slug String @unique`) to allow clean URL lookups at `/listings/:slug` for both web and mobile applications. Parent listings use `onDelete: Restrict` on child relations to prevent accidental orphans.
  ```

---

### B. Updates to [database.md](file:///C:/dev/salafi-audios/docs/database.md)

- **Change:**
  1. Revise the Core Domain Shape (L20-26) to reference unified listings.
  2. Document the complete removal of `AnalyticsEvent` from the transactional PostgreSQL schema (L30-32).
  3. Remove references to the custom ingestion utility; replace with Prisma seeders (L70-74).
  4. Document Decoupled Audit Columns, Counter Sync Rules, GIN Trigram Search, and GDPR Cascades.
- **Revised Content:**

  ```markdown
  ### Core Domain Shape

  - **Scholars**: authoritative teaching source profiles (name, bio, image, social links).
  - **Listings**: a single hierarchical table storing collections, series, and singles using parent relations.
  - **AudioAssets**: file URL metadata points linked directly to singles.

  ### Data Exclusions

  - Analytics events (the Clickstream events table is fully removed from PostgreSQL; analytics must be sent directly to external collectors like PostHog or ClickHouse).

  ### Seeding and Updates

  - Local database seeding is orchestrated via the standard `prisma db seed` command. Production catalog additions are managed through administrative API endpoints.

  ### Auditing, Caching, and Trigram Search

  - **Audit Columns**: `createdBy`, `updatedBy`, and `deletedBy` are stored as independent, decoupled `String? @db.Uuid` columns to track history without strict database cascades.
  - **Counter Sync**: listings maintain a denormalized `publishedLectureCount` and `publishedDurationSeconds` synchronized inside a database transaction during repository writes.
  - **Trigram Search**: the database uses PostgreSQL `pg_trgm` extension. The Listing model contains a GIN index on the `title` field for fuzzy searches.

  ### Privacy and Hard Deletions

  - GDPR compliance is backend-enforced. When a user requests hard deletion, executing `DELETE /account` cascades and purges all personal rows (`Session`, `Account`, `AdminPermission`, `UserListingProgress`, `FavoriteListing`) using `onDelete: Cascade` rules, while decoupled listing audit columns preserve catalog integrity.
  ```

---

### C. Updates to [api.md](file:///C:/dev/salafi-audios/docs/api.md)

- **Change:**
  1. Standardize authorization roles and endpoint namespace targets (L65-71).
  2. Add section detailing sub-resource paths and permissions DTO standardization.
- **Revised Content:**

  ```markdown
  ### Authorization

  - Roles are explicit and backend-enforced via the `UserRole` enum (`user`, `admin`, `editor`, `superadmin`).
  - Authorization is verified for every protected action. Scoped editor permissions must be evaluated against the targeted Listing or Scholar context.

  ### Route Mappings & Resource Namespaces

  - Public listing details are resolved by a globally unique slug at `GET /listings/:slug` for both web and mobile clients.
  - Permissions endpoints are mapped as a nested sub-resource under the User resource space at `/admin/users/:userId/permissions`.
  - Read and write permission endpoints standardize on returning string arrays (`string[]`) of permission names.
  - GDPR account deletions are resolved via `DELETE /account` and administrative user deletion endpoints.
  ```

---

### D. Updates to [architecture.md](file:///C:/dev/salafi-audios/docs/architecture.md)

- **Change:** Update database technology specs and remove the `util-ingest` package details.
- **Revised Content:**
  ```markdown
  - Monorepo: Bun Workspaces, Turborepo
  - Backend: NestJS, Prisma, PostgreSQL (with native UUIDv4 primary keys and pg_trgm GIN indexing)
  - Web: Next.js, React, Unistyles
  - Mobile: Expo, React Native, Expo Router, Unistyles
  - Shared: TypeScript, Zod, TanStack Query
  ```
