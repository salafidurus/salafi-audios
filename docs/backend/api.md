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
- See **[authentication](../security/authentication.md)** for the end-to-end mechanism: per-platform
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
- The access endpoint replaces the former separate grant and role endpoints with a versioned aggregate snapshot and replacement operation.
- GDPR account deletions are resolved via `DELETE /account` and administrative user deletion endpoints.
- Personal sync state exposes matched bulk-push/delta-pull pairs per resource: `POST /audio/progress/sync` + `GET /audio/progress?since=` for progress, `POST /me/my-library/saved/sync` + `GET /me/my-library/saved/delta?since=` for saved state. Both bulk-push bodies use a unified `{ items: [...] }` shape (one endpoint per resource, not split save/unsave or start/stop calls) so the client-side sync engine (`@sd/core-sync`) can treat every resource the same way.

### Sync and Conflict Resolution

- Clients record intent locally first (`@sd/core-sync`'s entity store + persisted outbox — see [mobile.md](../clients/mobile.md#6-sync-architecture)) and push it via debounced bulk-sync calls; the backend is always the conflict-resolution authority, never the client.
- Conflicts resolve by **last-write-wins on `updatedAt`**, implemented as a raw `INSERT ... ON CONFLICT DO UPDATE ... CASE WHEN updatedAt > ...` upsert (see `AudioRepository.bulkSync`, `MyLibraryRepository.bulkSync`). This is the house convention for every future sync resource.
- Progress additionally merges `isCompleted` **monotonically** — an older write can never un-complete a lesson. My Library saved state uses **plain** LWW on a `deletedAt` tombstone instead, since a later unsave must be able to override an earlier save (and vice versa); see [database.md](../data/database.md#9-soft-delete-tombstones-for-delta-sync).
- Delta-pull endpoints (`?since=`) return tombstoned/removed rows too, so an offline client can reconcile deletions instead of only ever accumulating state.

## 6. Media and Analytics Through the API

### Progress buffering

Progress writes remain PostgreSQL-authoritative. High-frequency playback
updates may be coalesced in Redis by the API repository and flushed to
PostgreSQL within two minutes. Redis is an optimization only; it is not a
source of truth.

The API falls back to direct PostgreSQL progress writes when Redis is
unconfigured or unavailable. Progress may lose a recently buffered update if
Redis permanently loses the pending record, which is acceptable for playback
continuity state.

Bulk progress reconciliation remains a direct PostgreSQL transaction and
continues to use client timestamps and backend last-write-wins conflict
resolution.

- Media uploads must be authorized by the backend before clients can write to storage.
- Media delivery may be CDN-backed, but access patterns are still governed by backend-issued references and content visibility rules.
- Analytics endpoints are intentionally isolated from authoritative core state.

## 7. Contracts and Documentation

- `@sd/core-contracts` is the shared TypeScript contract package for clients and server.
- Swagger/OpenAPI may be exposed in development at `/api/docs` when enabled.
- Public client base URLs are configured via `NEXT_PUBLIC_API_URL` for web and `EXPO_PUBLIC_API_URL` for mobile.

### API rate-limit policies

The API uses Fastify-native `@fastify/rate-limit` with an application-owned named policy boundary. Routes may select a policy explicitly; unannotated public and protected routes fall back to `public-read` and `authenticated` respectively.

| Policy             | Production budget         | Global safety ceiling |
| ------------------ | ------------------------- | --------------------- |
| `global-safety`    | 600 requests / 60 seconds | No                    |
| `public-read`      | 120 / 60 seconds          | Yes                   |
| `authenticated`    | 60 / 60 seconds           | Yes                   |
| `authentication`   | 10 / 60 seconds           | Yes                   |
| `admin-write`      | 30 / 60 seconds           | Yes                   |
| `expensive-search` | 20 / 60 seconds           | Yes                   |
| `health-probe`     | 30 / 10 seconds           | No                    |

Health endpoints intentionally bypass the ordinary global ceiling so monitoring cannot consume application traffic capacity, but they retain their own short-window budget. Test mode uses two requests per second for deterministic rejection tests. `DISABLE_THROTTLER=true` disables enforcement for local/test setups that need unrestricted traffic.

Authenticated buckets use the trusted backend session user ID. Anonymous buckets use Fastify's resolved `request.ip`; forwarded addresses only affect that value when `TRUST_PROXY_HOPS` is explicitly configured (zero by default). Redis-backed counters are enabled when `REDIS_URL` is present and use the existing environment namespace. All policies fail open on rate-limit storage errors to preserve API availability; this is intentional and is separate from authentication or authorization failures.

Rejected requests return HTTP 429 with `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`, and `retry-after` headers.

## 8. Evolution Rules

- Prefer extending contracts over replacing them.
- Deprecate intentionally rather than letting clients drift.
- If API behavior changes materially, update docs and `@sd/core-contracts` together.

## 9. Runtime Stack and Version Floor

### Version Constraints

- **Runtime Environment**: Node.js `>= 22.12.0` (required by NestJS 12 for native ESM/CJS compatibility features).
- **Nest CLI Environment**: `@nestjs/cli` `>= 22.22.3`.
- **Package Manager & Test Runner**: Bun `>= 1.4.0` (direct TypeScript execution via SWC transpiler retains raw `.ts` source execution with zero intermediate build output).

### Companion Migration Tracking

The companion packages are kept in their isolated state temporarily, with complete decoupling or rewrite migration scheduled in subsequent tickets:

- **Validation Schema Migration**: NestJS 12 Standard Schema (Ticket #752).
- **Health Verification**: Transitioning to application-owned health checks and removing `@nestjs/terminus` (Ticket #753).
- **Throttling Policies**: Redesigning around Fastify-native rate limiting and removing `@nestjs/throttler` (Ticket #754).
- **Logging Integration**: Decoupling `nestjs-pino` and correcting health log noise (Ticket #755).
