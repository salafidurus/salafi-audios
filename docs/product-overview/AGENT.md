# AGENT.md - Product Overview

Concise reference for Salafi Durus product philosophy and implementation state.

---

## Vision (One Paragraph)

**Salafi Durus** makes authentic Salafi knowledge accessible, reliable, and practical for daily life. It solves fragmentation, poor structure, and offline limitations by providing a curated, structured, and durable platform dedicated to trustworthy scholars and sound methodology.

---

## Core Principles

| Principle                      | Meaning                                             |
| ------------------------------ | --------------------------------------------------- |
| **Trust over virality**        | Content is curated and moderated, not crowdsourced  |
| **Usability over novelty**     | Features serve listening, study, and retention      |
| **Longevity over convenience** | Content remains accessible and meaningful long-term |

---

## User Roles

| Role               | Scope                                              |
| ------------------ | -------------------------------------------------- |
| **Listener**       | Browse, search, play, track progress, download     |
| **Admin**          | Full curation, moderation, user management         |
| **Scholar Editor** | Manage their own content under defined permissions |

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
| search          | INTEGRATED  | CRITICAL   | Active in web/mobile                          |
| health          | IMPLEMENTED | CRITICAL   | Deployment/monitoring                         |
| topics          | IMPLEMENTED | SUPPORTING | Used in search filter                         |
| analytics       | PARTIAL     | SUPPORTING | Stats endpoint used; event ingestion deferred |
| recommendations | PREMATURE   | SUPPORTING | 9 endpoints; simplify to hero-only            |

### Web (apps/web)

| Route                 | Status      | MVP        | Notes                  |
| --------------------- | ----------- | ---------- | ---------------------- |
| `/`                   | IMPLEMENTED | CRITICAL   | Search landing         |
| `/searchprocessing`   | IMPLEMENTED | CRITICAL   | Active search          |
| `/scholars/[slug]`    | MISSING     | CRITICAL   | Scholar detail page    |
| `/collections/[id]`   | MISSING     | CRITICAL   | Collection detail page |
| `/series/[id]`        | MISSING     | CRITICAL   | Series detail page     |
| `/lectures/[id]`      | MISSING     | CRITICAL   | Lecture detail page    |
| `/feed/*`             | PLACEHOLDER | SUPPORTING | Feed pages             |
| `/library/*`          | PLACEHOLDER | SUPPORTING | Library pages          |
| `/account/*`          | PLACEHOLDER | SUPPORTING | Account pages          |
| `/sign-in`, `/signup` | PLACEHOLDER | SUPPORTING | Auth flows             |

### Mobile (apps/mobile)

| Feature           | Status      | MVP      | Notes                 |
| ----------------- | ----------- | -------- | --------------------- |
| Search home       | IMPLEMENTED | CRITICAL | Uses ui-mobile        |
| Search processing | IMPLEMENTED | CRITICAL | Uses ui-mobile        |
| Catalog browsing  | MISSING     | CRITICAL | Detail screens needed |
| Audio playback    | NOT STARTED | CRITICAL | Phase 05              |
| Progress tracking | NOT STARTED | CRITICAL | Phase 05              |
| Offline sync      | NOT STARTED | CRITICAL | Phase 06              |
| Downloads         | NOT STARTED | CRITICAL | Phase 06              |

---

## Key Documentation Files

| File                                  | Purpose                       |
| ------------------------------------- | ----------------------------- |
| `01-vision-and-purpose.md`            | Mission, goals, problem space |
| `02-product-philosophy.md`            | Core principles               |
| `03-user-roles.md`                    | Role definitions              |
| `04-system-architecture.md`           | High-level structure          |
| `05-data-and-media-ownership.md`      | Data categories, ownership    |
| `06-platform-responsibilities.md`     | Platform boundaries           |
| `07-offline-and-sync-philosophy.md`   | Offline concepts              |
| `08-security-and-trust-boundaries.md` | Trust model, authorization    |
| `09-scalability-and-evolution.md`     | Growth strategy               |

---

## Updating This File

When implementing features:

1. Update status columns (IMPLEMENTED → INTEGRATED)
2. Add new modules/routes as they're created
3. Mark PREMATURE modules as REFINED when simplified
4. Keep gap analysis in sync with actual implementation
