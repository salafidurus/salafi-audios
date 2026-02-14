# Catalog Routing, Recommendations, and Stats

## Purpose

This document defines Phase 03 public routing expectations, the recommendations contract,
and the stats module plan. These choices keep the web and mobile clients aligned with
backend authority while leaving room for future recommendation systems.

---

## Public Routing Map (Phase 03)

Public routes must be stable, semantic, and SEO-friendly. These routes are used by both
web and mobile clients and must not encode business logic.

### Scholars

- List: `/scholars`
- Detail: `/scholars/:scholarSlug`

### Collections

- Detail: `/collections/:scholarSlug/:collectionSlug`

### Series

- Detail: `/series/:scholarSlug/:seriesSlug`

### Lectures

- Detail: `/lectures/:scholarSlug/:lectureSlug`

Routing must remain declarative. Route composition lives in `apps/web/src/app/` and
is orchestrated by feature-owned screen loaders.

---

## Recommendations Module (Planned)

Recommendations are a client-facing contract for curated or ranked content. The initial
implementation may be manual, but the contract must remain stable so future AI-driven
systems can swap in without client changes.

### Recommendation Item Contract

Each recommendation item must include:

- `kind`: `lecture | series | collection`
- `entityId`: stable backend ID
- `entitySlug`: URL slug for routing
- `title`: display title
- `subtitle`: optional secondary label (scholar or topic)
- `coverImageUrl`: optional media
- `publishedAt`: optional date (when relevant)
- `presentedBy`: scholar name (when relevant)
- `presentedBySlug`: scholar slug (for routing)

Clients must not infer recommendation intent from missing fields. If a value matters,
the backend should provide it explicitly.

### Future AI Roadmap (Non-Binding)

- Recommendation ranking signals must remain non-authoritative.
- Any AI-derived signals are advisory only and do not modify authoritative content.
- Recommendation logic remains backend-owned; clients render only what the backend
  returns.

---

## Stats Module (Planned)

Public stats are aggregated, non-authoritative, and must be served by the backend.
Clients must never compute global stats locally.

### Home Stats Contract

The home stats response includes:

- `totalScholars`
- `totalLectures`
- `lecturesPublishedLast30Days`

### Storage and Refresh Strategy

- Use a materialized aggregate table or cached snapshot updated on a schedule.
- Stats must be fast to fetch and safe to cache.
- Updates are asynchronous; clients tolerate eventual consistency.

### Guardrails

- Stats do not affect business logic or permissions.
- Stats failures must never block core browsing flows.

---

## Scope Notes

- This document applies to Phase 03 public browsing.
- Admin controls for recommendations and stats management are deferred.
- Clients must only consume backend contracts and avoid derived authority.
