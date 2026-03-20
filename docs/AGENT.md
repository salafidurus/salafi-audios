# AGENT.md - Documentation Index

This directory contains the authoritative documentation for Salafi Durus.

## Documentation Hierarchy

1. **Root AGENT.md** → Monorepo orientation and high-level rules.
2. **This file** → Documentation index, timeline summary, and gap analysis.
3. **[README.md](./README.md)** → Standard entry point for humans.
4. **Workspace AGENT.md** → Context for `apps/` and `packages/`.

---

## Timeline Summary

| Phase | Name                | Status      | Key Deliverables                            |
| ----- | ------------------- | ----------- | ------------------------------------------- |
| 01    | Foundations         | COMPLETE    | Monorepo, CI/CD, environments               |
| 02    | Model & Ingestion   | COMPLETE    | Schema, Prisma, ingestion pipeline          |
| 03    | Read-Only Catalog   | PARTIAL     | APIs exist; web/mobile detail pages missing |
| 04    | Auth & User State   | PARTIAL     | Auth is live; user-state features are early |
| 05    | Playback & Progress | NOT STARTED | Audio player, progress tracking             |
| 06    | Offline & Downloads | NOT STARTED | Offline playback, outbox sync               |
| 07    | Admin & Uploads     | NOT STARTED | Admin workflows, moderation                 |
| 08    | Polish & Analytics  | NOT STARTED | UX polish, analytics integration            |

---

## Implementation Gap Analysis

### Backend (apps/api)

| Module          | Status      | MVP        | Notes                                         |
| --------------- | ----------- | ---------- | --------------------------------------------- |
| scholars        | IMPLEMENTED | CRITICAL   | API complete; needs web/mobile screens        |
| collections     | IMPLEMENTED | CRITICAL   | API complete; needs web/mobile screens        |
| series          | IMPLEMENTED | CRITICAL   | API complete; needs web/mobile screens        |
| lectures        | IMPLEMENTED | CRITICAL   | API complete; needs web/mobile screens        |
| audio-assets    | IMPLEMENTED | CRITICAL   | Required for playback (Phase 05)              |
| catalog         | IMPLEMENTED | CRITICAL   | Browse endpoints exist                        |
| health          | IMPLEMENTED | SUPPORTING | Deployment and monitoring                     |
| search          | INTEGRATED  | CRITICAL   | Active in web/mobile                          |
| topics          | IMPLEMENTED | SUPPORTING | Used in search filter                         |
| analytics       | PARTIAL     | SUPPORTING | Stats endpoint used; event ingestion deferred |
| recommendations | IMPLEMENTED | SUPPORTING | Multiple endpoints exist; may be narrowed later |

### Web (apps/web)

| Route                 | Status      | MVP        | Notes                  |
| --------------------- | ----------- | ---------- | ---------------------- |
| `/`                   | IMPLEMENTED | CRITICAL   | Search landing         |
| `/searchprocessing`   | IMPLEMENTED | CRITICAL   | Active search          |
| `/scholars/[slug]`    | MISSING     | CRITICAL   | Scholar detail page    |
| `/collections/[id]`   | MISSING     | CRITICAL   | Collection detail page |
| `/series/[id]`        | MISSING     | CRITICAL   | Series detail page     |
| `/lectures/[id]`      | MISSING     | CRITICAL   | Lecture detail page    |
| `/feed/*`             | PLACEHOLDER | SUPPORTING | Feed pages exist but are early   |
| `/library/*`          | PLACEHOLDER | SUPPORTING | Library routes exist but are early |
| `/account/*`          | PLACEHOLDER | SUPPORTING | Account routes exist but are early |
| `/sign-in`, `/sign-up` | IMPLEMENTED | SUPPORTING | Using `@sd/feature-auth`        |

### Mobile (apps/mobile)

| Feature           | Status      | MVP      | Notes                 |
| ----------------- | ----------- | -------- | --------------------- |
| Search home       | IMPLEMENTED | CRITICAL | Uses `@sd/feature-search` |
| Search processing | IMPLEMENTED | CRITICAL | Uses `@sd/feature-search` |
| Catalog browsing  | MISSING     | CRITICAL | Detail screens needed |
| Audio playback    | NOT STARTED | CRITICAL | Planned for Phase 05  |
| Progress tracking | NOT STARTED | CRITICAL | Planned for Phase 05  |
| Offline sync      | NOT STARTED | CRITICAL | Phase 06              |
| Downloads         | NOT STARTED | CRITICAL | Phase 06              |

---

## Key Documentation Files

- **[prd.md](./prd.md)** — Vision, philosophy, user roles, and guardrails.
- **[architecture.md](./architecture.md)** — Monorepo structure and system architecture.
- **[api.md](./api.md)** — Backend architecture and API design.
- **[database.md](./database.md)** — DB schema and media management.
- **[mobile.md](./mobile.md)** — Mobile app and offline mechanics.
- **[web.md](./web.md)** — Web app structure and SEO.
- **[dev-ops.md](./dev-ops.md)** — Environments and deployment.

## Scope of This Folder

- This folder keeps the standard, cross-cutting documentation set.
- Workspace `AGENT.md` files hold app- and package-specific conventions, commands, and implementation notes.
- Avoid recreating deep per-topic doc trees unless the information cannot live cleanly in the standard set or a workspace `AGENT.md`.

---

## Documentation as Enforcement

- Architectural changes require documentation updates.
- Undocumented behavior is considered incomplete.
- Docs reflect intent, not just implementation.
- If implementation diverges from docs, reconcile intentionally.
