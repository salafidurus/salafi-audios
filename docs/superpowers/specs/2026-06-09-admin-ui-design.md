# Admin UI — Design Spec

**Date:** 2026-06-09
**Status:** Approved

---

## Problem

The admin section of the platform exists on web only and covers only four areas: scholars, topics,
livestream status changes, and permissions. There is no UI for:

- Creating or managing lectures and their audio assets
- Managing livestream channels and creating sessions manually
- Managing series and collections per scholar
- Any admin functionality on the native app

---

## Goal

Deliver a complete admin UI across both `apps/web` and `apps/native` that allows administrators
to manage the full content lifecycle: audio uploads, lecture metadata, series, collections,
livestream channels, and live sessions.

---

## Decisions Made

| Question                       | Decision                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Admin feature structure        | Separate feature folders per domain (Option B)                                                  |
| Series/collections navigation  | Hybrid — top-level lectures list, series/collections nested under scholar detail                |
| Audio file provision           | Multi-file select → client parses metadata → direct R2 upload via presigned URL → API links URI |
| Files per lecture              | One file = one lecture stub                                                                     |
| Lecture editing                | Modal-based (not inline, not dedicated page)                                                    |
| Native admin entry point       | Stack nested under Account tab, permission-gated card                                           |
| Livestream session creation    | Manual create form for override control; auto-scheduling is primary                             |
| Channel form helper text       | Always-visible muted helper lines per field (not tooltips)                                      |
| Presigned URL endpoint         | `POST /admin/media/presigned-url` under a dedicated `media` module                              |
| Series/collections API shape   | Flat admin endpoints (`/admin/series`, `/admin/collections`); UI is hierarchical                |
| Permission for live management | `manage:livestreams` (existing enum value) — admin-live controller must be updated to match     |
| Client-side audio metadata     | Web Audio API (`AudioContext.decodeAudioData()`) parses duration/size before upload             |
| Bulk actions                   | Dedicated bulk endpoints (`POST /admin/lectures/bulk`, etc.) — no client-side fan-out           |
| Drag-and-drop library (native) | `react-native-draggable-flatlist`; order persisted optimistically, confirmed on API response    |
| Audio asset replacement        | `PUT /admin/lectures/:id` with a new `audioKey` — no separate audio-replace endpoint            |
| Presigned URL purpose values   | `"audio"` and `"image"` — same permission check (`manage:content`) for both                     |

---

## Architecture

### New Feature Folders

Both `apps/web/src/features/` and `apps/native/src/features/` receive:

```text
admin-lectures/     ← lecture list, upload flow, edit modal, publish/archive, bulk actions
admin-live/         ← channel CRUD, session create/edit, status controls
admin-scholars/     ← scholars list + scholar detail with series/collections
```

The existing `features/admin/` (web) becomes dashboard-only. A new `features/admin/` is created
in native for the dashboard + permission gate.

### New Backend Module

```text
apps/api/src/modules/media/   ← MediaService with S3Client configured for Cloudflare R2
```

### Web Routing

Under `apps/web/src/app/(main)/(admin)/admin/`:

```text
lectures/page.tsx        ← new
live/page.tsx            ← replaces livestreams/page.tsx
scholars/page.tsx        ← extended (links to detail)
scholars/[id]/page.tsx   ← new — scholar detail with series + collections
```

### Native Routing

Nested under the Account tab:

```text
(tabs)/account/(admin)/
  _layout.tsx            ← stack layout
  index.tsx              ← admin dashboard
  lectures/index.tsx     ← lectures list + upload
  live/index.tsx         ← channels + sessions tabs
  scholars/index.tsx     ← scholars list
  scholars/[id].tsx      ← scholar detail
```

The Account screen renders an "Admin" card only when the user holds at least one `manage:*`
permission. The check calls the existing `GET /admin/permissions/me` endpoint, which is already
used by the web admin dashboard. The result is cached for the duration of the session.

---

## Feature 1: Lectures Management

### Lecture List

- Paginated table (web) / flat list (native)
- Columns: title, scholar name, status badge, duration, order index, created date
- Filters: scholar dropdown, status (draft / published / archived)
- Search by title
- Multi-select checkboxes on each row; bulk action bar appears when ≥1 row is selected
- When filtered to a single series, rows support drag-and-drop reordering; on drop,
  `PUT /admin/lectures/:id` is called with `{ orderIndex: <new value> }`. The existing
  `AdminLectureUpdateDto` already includes `orderIndex` — no new contract is needed.

### Upload Flow

"Upload Audio" button opens a multi-file picker (`.mp3`, `.m4a`). For each selected file:

1. Client parses audio metadata client-side using `AudioContext.decodeAudioData()` (duration,
   file size, format). Falls back to a hidden `<audio>` element if decoding fails. The parsed
   metadata (duration, size) is shown to the admin for review before proceeding.
2. UI calls `POST /admin/media/presigned-url` with `{ filename, contentType, purpose: "audio" }`
3. API enforces `manage:content` permission and returns `{ uploadUrl, publicUrl, objectKey }`
4. UI uploads the file directly to R2 via `PUT` to `uploadUrl` (progress tracked per file via
   `XMLHttpRequest` or `fetch` with progress callback)
5. On upload success, UI calls `POST /admin/lectures` with `CreateLectureDto` including the
   `objectKey` and parsed metadata. Response is `AdminLectureDetailDto`.
6. API creates `Lecture` + `AudioAsset` (with `isPrimary: true`) in a single DB transaction
7. Created stubs appear in the list with `draft` status

The upload UI shows a queue with per-file progress bars. Individual failures can be retried.

Platform differences:

- Web: `<input type="file" multiple accept=".mp3,.m4a">` + `AudioContext`
- Native: `expo-document-picker` + `expo-file-system` `uploadAsync` with progress callback

### Edit Modal

Triggered by clicking any lecture row. The client fetches `GET /admin/lectures/:id` to populate
the form. Fields:

- Title, description, language selector
- Scholar assignment (dropdown)
- Series assignment (dropdown filtered by selected scholar)
- Topics (multi-select)
- Order index
- Audio asset — current filename shown with duration; "Replace audio" action re-runs the
  single-file upload flow then submits `PUT /admin/lectures/:id` with the new `audioKey`
- Publish / Archive actions

Native: modal becomes a bottom sheet.

### Bulk Actions

When rows are selected in the lectures list, a sticky action bar appears with "Publish selected"
and "Archive selected". These call dedicated bulk endpoints:

- `POST /admin/lectures/bulk` — body: `{ action: "publish" | "archive", ids: string[] }`
- Response: `{ succeeded: string[], failed: string[] }` — the UI highlights any failed rows

The bulk bar shows a loading state while the request is in flight. On completion, the list
refreshes and any failed rows are flagged with an error indicator.

### New API Endpoints

| Method | Path                         | Purpose                                                    |
| ------ | ---------------------------- | ---------------------------------------------------------- |
| `GET`  | `/admin/lectures`            | List all lectures (paginated, filter by scholar/status)    |
| `GET`  | `/admin/lectures/:id`        | Fetch lecture detail for edit modal                        |
| `POST` | `/admin/lectures`            | Create lecture + AudioAsset in transaction after R2 upload |
| `POST` | `/admin/lectures/bulk`       | Bulk publish or archive                                    |
| `POST` | `/admin/media/presigned-url` | Issue R2 presigned URL; enforce `manage:content`           |

### New Contracts

**New DTOs in `packages/core-contracts/src/types/`:**

- `PresignedUrlRequestDto` — `{ filename, contentType, purpose: "audio" | "image" }`
- `PresignedUrlResponseDto` — `{ uploadUrl, publicUrl, objectKey }`
- `CreateLectureDto` — `{ title, slug?, scholarId?, seriesId?, topics?: string[], audioKey, format?, durationSeconds?, sizeBytes? }`
- `AdminLectureListItemDto` — `{ id, title, scholarName, status, durationSeconds, createdAt }`
- `AdminLectureListDto` — `{ items: AdminLectureListItemDto[], total, page }`
- `AdminLectureDetailDto` — full fields for edit modal: extends `LectureViewDto` with `audioKey`
- `BulkActionDto` — `{ action: "publish" | "archive", ids: string[] }`
- `BulkActionResultDto` — `{ succeeded: string[], failed: string[] }`

**New entries in `endpoints.ts`:**

```typescript
admin: {
  lectures: {
    list: "/admin/lectures",
    detail: (id: string) => `/admin/lectures/${id}`,
    create: "/admin/lectures",
    update: (id: string) => `/admin/lectures/${id}`,
    publish: (id: string) => `/admin/lectures/${id}/publish`,
    archive: (id: string) => `/admin/lectures/${id}/archive`,
    bulk: "/admin/lectures/bulk",
  },
  media: {
    presignedUrl: "/admin/media/presigned-url",
  },
}
```

---

## Feature 2: Livestreams Management

Replaces the existing `/admin/livestreams` screen entirely.

### Permission Fix

The existing `AdminLiveController` uses `@RequiresPermission('manage:live')` but the
`ADMIN_PERMISSIONS` enum in `core-contracts` only contains `"manage:livestreams"`. The controller
must be updated to use `"manage:livestreams"` to match the enum.

### Layout

Two tabs: **Sessions** (default) and **Channels**.

### Sessions Tab

Preserves existing status-change behaviour (Go Live / End / Reschedule). Additions:

- "New Session" button — minimal create form: channel selector, optional title, optional
  scheduled date/time
- "Edit" action per row — same fields plus `telegramMsgId`
- Sessions grouped by status: Active → Scheduled → Ended

### Channels Tab

New. List columns: display name, Telegram slug, linked scholar, language, active/inactive badge.

- "New Channel" button — create form with always-visible helper text:
  - **Telegram ID** (required) — "The numeric channel ID from Telegram (e.g. `-1001234567890`).
    Find it by forwarding a message from the channel to `@userinfobot`."
  - **Display Name** (required) — "The name shown to users in the app. Can differ from the
    Telegram channel name."
  - **Telegram Slug** — "The channel's public username without the `@` (e.g. `duruschannel`).
    Leave blank if the channel is private."
  - **Language** — locale selector
  - **Scholar** — optional scholar link
- "Edit" action per row — same fields plus Active toggle
- Deactivating a channel does not delete its sessions

### New API Endpoints

| Method | Path                   | Purpose           |
| ------ | ---------------------- | ----------------- |
| `GET`  | `/admin/live/channels` | List all channels |

The following already exist in `AdminLiveController` and require no new backend work:
`POST /admin/live/channels`, `PUT /admin/live/channels/:id`,
`POST /admin/live/sessions`, `PUT /admin/live/sessions/:id`,
`PATCH /admin/live/sessions/:id/status`.

### New Entries in `endpoints.ts`

```typescript
admin: {
  live: {
    listChannels: "/admin/live/channels",
    createChannel: "/admin/live/channels",
    updateChannel: (id: string) => `/admin/live/channels/${id}`,
    createSession: "/admin/live/sessions",
    updateSession: (id: string) => `/admin/live/sessions/${id}`,
    updateStatus: (id: string) => `/admin/live/sessions/${id}/status`,
  },
}
```

---

## Feature 3: Scholars Admin with Series & Collections Drill-Down

### Scholars List

Existing screen simplified: inline create/edit form is removed. Each row now has an "Edit"
link that navigates to the scholar detail page. "Add Scholar" button navigates to the detail
page in create mode.

### Scholar Detail Page — `/admin/scholars/[id]`

Three sections:

**Scholar Info**
Full edit form: name, slug, bio, image URL, isKibar, isFeatured, isActive. Save button.
Note: `UpdateScholarDto` must be extended to include `isFeatured` (currently missing from
the existing DTO).

**Series**
List: title, status badge, lecture count, order index. Supports drag-and-drop reordering.

- "New Series" modal — title (required), description, cover image URL, language, order index
- "Edit" modal — fetches `GET /admin/series/:id` to populate; same fields
- Inline publish / archive toggle per row
- Multi-select + bulk action bar (same pattern as lectures)

**Collections**
Same pattern as Series. Supports drag-and-drop reordering.

- "New Collection" modal — title (required), description, cover image URL, language, order index
- "Edit" modal — fetches `GET /admin/collections/:id` to populate; same fields
- Inline publish / archive toggle per row
- Multi-select + bulk action bar

Native: modals become bottom sheets; sections are collapsible.

### API Shape

Series and collections use flat admin endpoints. The UI passes `scholarId` as a query param
for list calls and as a body field for create calls.

### New API Endpoints

| Method  | Path                             | Purpose                                                           |
| ------- | -------------------------------- | ----------------------------------------------------------------- |
| `GET`   | `/admin/series`                  | List series (filter by `?scholarId=`)                             |
| `GET`   | `/admin/series/:id`              | Fetch series detail for edit modal                                |
| `POST`  | `/admin/series`                  | Create series                                                     |
| `PATCH` | `/admin/series/:id`              | Update series; also used for `orderIndex` after drag-and-drop     |
| `POST`  | `/admin/series/:id/publish`      | Publish series                                                    |
| `POST`  | `/admin/series/:id/archive`      | Archive series                                                    |
| `POST`  | `/admin/series/bulk`             | Bulk publish or archive                                           |
| `GET`   | `/admin/collections`             | List collections (filter by `?scholarId=`)                        |
| `GET`   | `/admin/collections/:id`         | Fetch collection detail for edit modal                            |
| `POST`  | `/admin/collections`             | Create collection                                                 |
| `PATCH` | `/admin/collections/:id`         | Update collection; also used for `orderIndex` after drag-and-drop |
| `POST`  | `/admin/collections/:id/publish` | Publish collection                                                |
| `POST`  | `/admin/collections/:id/archive` | Archive collection                                                |
| `POST`  | `/admin/collections/bulk`        | Bulk publish or archive                                           |

### New Contracts

**New DTOs in `packages/core-contracts/src/types/`:**

- `AdminSeriesListItemDto` — `{ id, title, status, publishedLectureCount, orderIndex }`
- `AdminSeriesDetailDto` — `{ id, scholarId, title, description?, coverImageUrl?, language?, status, orderIndex? }`
- `CreateSeriesDto` — `{ scholarId, title, description?, coverImageUrl?, language?, orderIndex? }`
- `UpdateSeriesDto` — all fields optional
- `AdminCollectionListItemDto` — same shape as `AdminSeriesListItemDto`
- `AdminCollectionDetailDto` — same shape as `AdminSeriesDetailDto`
- `CreateCollectionDto` — same shape as `CreateSeriesDto`
- `UpdateCollectionDto` — all fields optional

`BulkActionDto` and `BulkActionResultDto` are shared across lectures, series, and collections.

**New entries in `endpoints.ts`:**

```typescript
admin: {
  series: {
    list: "/admin/series",
    detail: (id: string) => `/admin/series/${id}`,
    create: "/admin/series",
    update: (id: string) => `/admin/series/${id}`,
    publish: (id: string) => `/admin/series/${id}/publish`,
    archive: (id: string) => `/admin/series/${id}/archive`,
    bulk: "/admin/series/bulk",
  },
  collections: {
    list: "/admin/collections",
    detail: (id: string) => `/admin/collections/${id}`,
    create: "/admin/collections",
    update: (id: string) => `/admin/collections/${id}`,
    publish: (id: string) => `/admin/collections/${id}/publish`,
    archive: (id: string) => `/admin/collections/${id}/archive`,
    bulk: "/admin/collections/bulk",
  },
}
```

---

## Additional Goals

### Bulk Publish / Archive

Lectures, series, and collections lists support multi-select with a sticky bulk action bar.
When ≥1 rows are selected, "Publish selected" and "Archive selected" actions appear.

Each resource has a dedicated bulk endpoint:

- `POST /admin/lectures/bulk` — `{ action: "publish" | "archive", ids: string[] }`
- `POST /admin/series/bulk` — same shape
- `POST /admin/collections/bulk` — same shape

All return `BulkActionResultDto: { succeeded: string[], failed: string[] }`. The UI shows a
loading state during the request; on completion the list refreshes and failed rows are flagged.

### Drag-and-Drop Reordering

Series and collections within a scholar detail page support drag-and-drop reordering. Lectures
within a series support the same. On drop:

1. The client optimistically updates the displayed order
2. `PATCH /admin/series/:id` (or `/collections/:id`, `/lectures/:id`) is called with
   `{ orderIndex: <new value> }`
3. If the API call fails, the order reverts to the previous state with an error toast

Web: HTML5 drag-and-drop API. Native: `react-native-draggable-flatlist` (long-press to drag).

---

## Admin Dashboard Updates

### Web

Add a "Lectures" card to `ADMIN_SECTIONS` in the dashboard screen:

```text
{ title: "Lectures", description: "Upload audio, manage lectures, series, and collections",
  href: "/admin/lectures", permission: "manage:content" }
```

Update "Livestreams" href from `/admin/livestreams` to `/admin/live`.

### Native

New admin dashboard screen with the same permission-gated card grid. Cards:
Scholars, Lectures, Live, Permissions.

---

## Permissions Summary

| Permission           | Covers                                                              |
| -------------------- | ------------------------------------------------------------------- |
| `manage:content`     | Lectures, audio uploads, series, collections, bulk actions          |
| `manage:scholars`    | Scholar profiles, scholar detail page                               |
| `manage:livestreams` | Channels, sessions (fixes existing `manage:live` bug in controller) |
| `manage:admin`       | Permissions screen                                                  |

---

## Non-Goals

- No multi-variant audio per lecture (one primary asset per lecture)
- No admin analytics or reporting
- No content moderation queue
