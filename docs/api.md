# Backend and API Specification

## 1. Backend Role

The backend (`apps/api`) is the authoritative core of the platform. It owns authentication, authorization, validation, workflow orchestration, content visibility, and integrity rules.

## 2. Backend Architecture

The backend follows a layered NestJS architecture.

### Layers

- **Interface**: controllers, DTO validation, guards, and request mapping.
- **Application**: service-layer use cases, orchestration, and transaction boundaries.
- **Domain**: invariants, state transition rules, and business concepts.
- **Infrastructure**: database access, media adapters, and external service integrations.

### Working Rules

- Controllers do not own business decisions.
- Business rules live in services and domain logic.
- Infrastructure provides capabilities but does not decide policy.
- Shared DTOs and response types are defined in `@sd/core-contracts`.

## 3. API Design Rules

The API is resource-oriented and intent-driven.

### Contract Rules

- Use plural nouns for primary resources.
- Keep contracts stable and explicit.
- Prefer additive evolution over breaking churn.
- Treat the API as the boundary shared by web, mobile, and backend tooling.

### Request and Response Rules

- JSON in and JSON out.
- Validate input shape at the interface boundary.
- Normalize errors into a predictable structure.
- Use pagination, filtering, and ordering explicitly rather than implicit client assumptions.

## 4. API Surface Segmentation

- **Public read APIs**: published catalog, search, recommendations, and other discovery endpoints.
- **Authenticated user APIs**: personal state and account-scoped actions.
- **Editorial/admin APIs**: protected content management and moderation operations.
- **Operational APIs**: health, diagnostics, and limited developer-facing documentation when enabled.

This segmentation matters more than route naming because trust boundaries are different for each surface.

## 5. Authentication and Authorization

Authentication and authorization are centralized in the backend.

### Authentication

- The current auth implementation is **Better Auth**.
- Identity is established through backend-managed auth flows and sessions.
- Web and mobile consume auth as clients; neither client owns the trust model.
- See **[auth.md](./auth.md)** for the end-to-end mechanism: per-platform
  credentials (web bearer token, native cookie), session validation, and the
  cross-site OAuth handoff.

### Authorization

- Attribute-based access control (CASL) is built from the caller's system roles and `UserAccessGrant` rows (`apps/api/src/core/auth/ability/ability.factory.ts`) and checked per-route by `PolicyGuard` via `@CheckPolicy(action, subjectType, resolver?)`.
- Read access is intentionally public for catalog data. Protected mutations use only the capabilities `write`, `translate`, `publish`, `delete`, and `manage`.
- Grants may be global or scoped to one or more scholars; translation grants may additionally be scoped to one or more locales. Topics are never scholar-scoped.
- Authorization is checked for every protected action, not inferred from the UI.
- Web and native ship the same packed ability rules to clients for convenience-only UI gating (`useAbility()`/`ability.can()` from `@sd/domain-account`) — the backend re-checks every request regardless of what the client shows.
- Offline state or cached client data never grants authority.

### Route Mappings & Resource Namespaces

- Public listing details are resolved by a globally unique slug at `GET /listings/:slug` for both web and mobile clients.
- User access management is mapped as a unified sub-resource at `/admin/users/:userId/access`.
- The access endpoint replaces the former split permission, scholar-role, and translator-role endpoints with a versioned aggregate snapshot and replacement operation.
- GDPR account deletions are resolved via `DELETE /account` and administrative user deletion endpoints.
- Personal sync state exposes matched bulk-push/delta-pull pairs per resource: `POST /audio/progress/sync` + `GET /audio/progress?since=` for progress, `POST /me/library/saved/sync` + `GET /me/library/saved/delta?since=` for saved/library. Both bulk-push bodies use a unified `{ items: [...] }` shape (one endpoint per resource, not split save/unsave or start/stop calls) so the client-side sync engine (`@sd/core-sync`) can treat every resource the same way.

### Sync and Conflict Resolution

- Clients record intent locally first (`@sd/core-sync`'s entity store + persisted outbox — see [mobile.md](./mobile.md#6-sync-architecture)) and push it via debounced bulk-sync calls; the backend is always the conflict-resolution authority, never the client.
- Conflicts resolve by **last-write-wins on `updatedAt`**, implemented as a raw `INSERT ... ON CONFLICT DO UPDATE ... CASE WHEN updatedAt > ...` upsert (see `AudioRepository.bulkSync`, `LibraryRepository.bulkSync`). This is the house convention for every future sync resource.
- Progress additionally merges `isCompleted` **monotonically** — an older write can never un-complete a lesson. Saved/library uses **plain** LWW on a `deletedAt` tombstone instead, since a later unsave must be able to override an earlier save (and vice versa); see [database.md](./database.md#9-soft-delete-tombstones-for-delta-sync).
- Delta-pull endpoints (`?since=`) return tombstoned/removed rows too, so an offline client can reconcile deletions instead of only ever accumulating state.

## 6. Media and Analytics Through the API

- Media uploads must be authorized by the backend before clients can write to storage.
- Media delivery may be CDN-backed, but access patterns are still governed by backend-issued references and content visibility rules.
- Analytics endpoints are intentionally isolated from authoritative core state.

## 7. Contracts and Documentation

- `@sd/core-contracts` is the shared TypeScript contract package for clients and server.
- Swagger/OpenAPI may be exposed in development at `/api/docs` when enabled.
- Public client base URLs are configured via `NEXT_PUBLIC_API_URL` for web and `EXPO_PUBLIC_API_URL` for mobile.

## 8. Evolution Rules

- Prefer extending contracts over replacing them.
- Deprecate intentionally rather than letting clients drift.
- If API behavior changes materially, update docs and `@sd/core-contracts` together.
