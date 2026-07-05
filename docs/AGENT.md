# AGENT.md - Documentation Index

This directory contains the authoritative documentation for Salafi Durus.

## Timeline Summary

| Phase | Name                | Status      | Key Deliverables                                           |
| ----- | ------------------- | ----------- | ---------------------------------------------------------- |
| 01    | Foundations         | COMPLETE    | Monorepo, CI/CD, environments                              |
| 02    | Model & Ingestion   | COMPLETE    | Schema, Prisma, ingestion pipeline                         |
| 03    | Read-Only Catalog   | PARTIAL     | Web routes complete; mobile catalog detail screens missing |
| 04    | Auth & User State   | PARTIAL     | Auth live; account, library, feed screens implemented      |
| 05    | Playback & Progress | NOT STARTED | Audio player, progress tracking                            |
| 06    | Offline & Downloads | NOT STARTED | Offline playback, outbox sync                              |
| 07    | Admin & Uploads     | NOT STARTED | Admin workflows, moderation                                |
| 08    | Polish & Analytics  | NOT STARTED | UX polish, analytics integration                           |

---

## Implementation Gap Analysis

### Backend (apps/api)

| Module          | Status      | MVP        | Notes                                                                     |
| --------------- | ----------- | ---------- | ------------------------------------------------------------------------- |
| listings        | IMPLEMENTED | CRITICAL   | Unified Listing model (replaces collections/series/lectures)              |
| scholars        | IMPLEMENTED | CRITICAL   | API complete; needs web/mobile screens                                    |
| audio-assets    | IMPLEMENTED | CRITICAL   | Required for playback (Phase 05)                                          |
| catalog         | IMPLEMENTED | CRITICAL   | Browse endpoints exist                                                    |
| health          | IMPLEMENTED | SUPPORTING | Deployment and monitoring                                                 |
| search          | INTEGRATED  | CRITICAL   | Active in web/mobile                                                      |
| topics          | IMPLEMENTED | SUPPORTING | Used in search filter                                                     |
| analytics       | REMOVED     | SUPPORTING | Clickstream table removed from PostgreSQL; deferred to dedicated pipeline |
| recommendations | IMPLEMENTED | SUPPORTING | Multiple endpoints exist; may be narrowed later                           |

### Web (apps/web)

| Route                  | Status      | MVP        | Notes                                                         |
| ---------------------- | ----------- | ---------- | ------------------------------------------------------------- |
| `/`                    | IMPLEMENTED | CRITICAL   | Search landing                                                |
| `/search`              | IMPLEMENTED | CRITICAL   | Active search                                                 |
| `/scholars/[slug]`     | IMPLEMENTED | CRITICAL   | Scholar detail page                                           |
| `/listings/[slug]`     | NOT STARTED | CRITICAL   | Unified listing detail (replaces collections/series/lectures) |
| `/feed/*`              | IMPLEMENTED | SUPPORTING | Recent + following feeds with infinite scroll                 |
| `/library/*`           | IMPLEMENTED | SUPPORTING | Saved and completed lists                                     |
| `/account/*`           | IMPLEMENTED | SUPPORTING | Profile and settings                                          |
| `/sign-in`, `/sign-up` | IMPLEMENTED | SUPPORTING | App-local `features/auth/` slices                             |

### Mobile (apps/native)

| Feature           | Status      | MVP      | Notes                                                |
| ----------------- | ----------- | -------- | ---------------------------------------------------- |
| Search            | IMPLEMENTED | CRITICAL | Home + active results                                |
| Feed              | IMPLEMENTED | CRITICAL | Recent + following feeds                             |
| Live              | IMPLEMENTED | CRITICAL | Live session screens                                 |
| Library           | IMPLEMENTED | CRITICAL | Saved and completed lists                            |
| Account           | IMPLEMENTED | CRITICAL | Profile and settings                                 |
| Catalog browsing  | MISSING     | CRITICAL | Detail screens (scholar/listing) not yet implemented |
| Audio playback    | NOT STARTED | CRITICAL | Planned for Phase 05                                 |
| Progress tracking | NOT STARTED | CRITICAL | Planned for Phase 05                                 |
| Offline sync      | NOT STARTED | CRITICAL | Phase 06                                             |
| Downloads         | NOT STARTED | CRITICAL | Phase 06                                             |

### Current Mobile Runtime Guardrail

- Packages consumed by mobile through root imports must expose a `react-native` package export and, when needed, a native root entry file such as `src/index.native.ts`.
- Using web-root package entries in native caused Expo Dev Client runtime failures in March 2026 by statically pulling `.web` and `.desktop.web` exports into the Android bundle graph.

---

## Key Documentation Files

- **[prd.md](./prd.md)** — Vision, philosophy, user roles, and guardrails.
- **[architecture.md](./architecture.md)** — Monorepo structure and system architecture.
- **[api.md](./api.md)** — Backend architecture and API design.
- **[auth.md](./auth.md)** — Cross-cutting authentication mechanism (api + web + native).
- **[database.md](./database.md)** — DB schema and media management.
- **[mobile.md](./mobile.md)** — Mobile app and offline mechanics.
- **[web.md](./web.md)** — Web app structure and SEO.
- **[dev-ops.md](./dev-ops.md)** — Environments and deployment.
