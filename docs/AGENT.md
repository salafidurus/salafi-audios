# AGENT.md - Documentation Index

This directory contains the authoritative documentation for Salafi Durus.

## Timeline Summary

| Phase | Name                | Status   | Key Deliverables                                                      |
| ----- | ------------------- | -------- | --------------------------------------------------------------------- |
| 01    | Foundations         | COMPLETE | Monorepo, CI/CD, environments                                         |
| 02    | Model & Ingestion   | COMPLETE | Schema, Prisma, ingestion pipeline                                    |
| 03    | Read-Only Catalog   | COMPLETE | Web and mobile listing/scholar discovery routes exist                 |
| 04    | Auth & User State   | COMPLETE | Auth, account, library, and progress sync implemented                 |
| 05    | Playback & Progress | COMPLETE | Audio player, local-first progress tracking (web + mobile)            |
| 06    | Offline & Downloads | COMPLETE | Offline audio downloads, outbox sync (mobile)                         |
| 07    | Admin & Uploads     | PARTIAL  | Admin content/scholars/users exist; stats/moderation remain limited   |
| 08    | Polish & Analytics  | PARTIAL  | Vexo web analytics and native Sentry/Vexo exist; admin stats is basic |

---

## Implementation Gap Analysis

### Backend (apps/api)

| Module       | Status      | MVP        | Notes                                                                     |
| ------------ | ----------- | ---------- | ------------------------------------------------------------------------- |
| listings     | IMPLEMENTED | CRITICAL   | Unified Listing model (replaces collections/series/lectures)              |
| scholars     | IMPLEMENTED | CRITICAL   | API complete; needs web/mobile screens                                    |
| audio-assets | IMPLEMENTED | CRITICAL   | Required for playback (Phase 05)                                          |
| catalog      | IMPLEMENTED | CRITICAL   | Browse endpoints exist                                                    |
| health       | IMPLEMENTED | SUPPORTING | Deployment and monitoring                                                 |
| search       | INTEGRATED  | CRITICAL   | Active in web/mobile                                                      |
| topics       | IMPLEMENTED | SUPPORTING | Used in search filter                                                     |
| analytics    | REMOVED     | SUPPORTING | Clickstream table removed from PostgreSQL; deferred to dedicated pipeline |

### Web (apps/web)

| Route                          | Status      | MVP        | Notes                                                     |
| ------------------------------ | ----------- | ---------- | --------------------------------------------------------- |
| `/`                            | IMPLEMENTED | CRITICAL   | Search landing                                            |
| `/search`                      | IMPLEMENTED | CRITICAL   | Active search                                             |
| `/scholars/[slug]`             | IMPLEMENTED | CRITICAL   | Scholar detail page                                       |
| `/listings/[slug]`             | IMPLEMENTED | CRITICAL   | Unified listing detail                                    |
| `/explore`, `/explore/recent`  | IMPLEMENTED | SUPPORTING | Browse and recent discovery surfaces                      |
| `/library`                     | IMPLEMENTED | SUPPORTING | Saved and completed list surfaces                         |
| `/settings/*`                  | IMPLEMENTED | SUPPORTING | Profile, display, support, and legal/account settings     |
| `/sign-in`                     | IMPLEMENTED | SUPPORTING | App-local `features/auth/` sign-in surface                |
| `/admin/*`                     | PARTIAL     | SUPPORTING | Dashboard, content, scholars, users, and stats            |

### Mobile (apps/native)

| Feature           | Status      | MVP      | Notes                                                      |
| ----------------- | ----------- | -------- | ---------------------------------------------------------- |
| Search            | IMPLEMENTED | CRITICAL | Home + active results                                      |
| Feed              | IMPLEMENTED | CRITICAL | Recent + following feeds                                   |
| Library           | IMPLEMENTED | CRITICAL | Saved and completed lists                                  |
| Account           | IMPLEMENTED | CRITICAL | Profile and settings                                       |
| Catalog browsing  | IMPLEMENTED | CRITICAL | Scholar/listing detail screens                             |
| Audio playback    | IMPLEMENTED | CRITICAL | `@sd/domain-audio`, prefers local downloads over streaming |
| Progress tracking | IMPLEMENTED | CRITICAL | Local-first, synced via `@sd/core-sync`                    |
| Offline sync      | IMPLEMENTED | CRITICAL | Persisted outbox, AppState/reconnect drain triggers        |
| Downloads         | IMPLEMENTED | CRITICAL | `expo-file-system` + SQLite registry                       |

### Current Mobile Runtime Guardrail

- Packages consumed by mobile through root imports must expose a `react-native` package export and, when needed, a native root entry file such as `src/index.native.ts`.
- Using web-root package entries in native caused Expo Dev Client runtime failures in March 2026 by statically pulling `.web` and `.desktop.web` exports into the Android bundle graph.

---

## Documentation Placement

- Product requirements belong under `product/`.
- Platform architecture stays in `architecture.md`.
- Client, backend, data, security, administration, and content documents belong
  in their named folders.
- Provider-neutral rules belong under `policies/`.
- Operational procedures belong under `runbooks/`; Dokploy procedures belong
  under `runbooks/infrastructure/`.
- Update an existing appropriate document before adding a new file or folder.

## Key Documentation Files

- **[product requirements](./product/requirements.md)** — Vision, philosophy, user roles, and guardrails.
- **[architecture.md](./architecture.md)** — Monorepo structure and system architecture.
- **[api.md](./backend/api.md)** — Backend architecture and API design.
- **[authentication](./security/authentication.md)** — Cross-cutting authentication mechanism.
- **[database.md](./data/database.md)** — Database and media management.
- **[mobile.md](./clients/mobile.md)** — Mobile app and offline mechanics.
- **[web.md](./clients/web.md)** — Web app structure and SEO.
- **[access management](./administration/access-management.md)** — Roles and scoped grants.
- **[deployment policy](./policies/deployment.md)** — Environments and delivery.
- **[runbooks](./runbooks/README.md)** — Operational procedures.
