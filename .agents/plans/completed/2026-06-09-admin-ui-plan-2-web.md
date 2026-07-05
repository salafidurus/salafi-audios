# Admin UI — Plan 2: Web Admin UI

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents
> available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`)
> syntax for tracking.

**Goal:** Build all web admin UI screens — lectures, livestreams (channels + sessions), and
scholars drill-down (series + collections) — in `apps/web`, following the existing desktop/mobile
split pattern.

**Architecture:** New feature folders (`admin-lectures`, `admin-live`, `admin-scholars`) each
own their screens, hooks, and API helpers. The existing `features/admin` becomes dashboard-only.
Existing admin routes are extended and one new route is added. All API calls use `httpClient` +
`endpoints` from `@sd/core-contracts`. React Query (`useApiQuery`) handles data fetching;
mutations call `httpClient` directly and then `refetch`.

**Tech Stack:** Next.js App Router, React, `@sd/core-contracts`, `useApiQuery`, `httpClient`,
HTML5 drag-and-drop API, Jest + React Testing Library.

**Prereq:** Plan 1 (API & Contracts) must be complete and the API running locally.

**Spec:** `.agents/plans/2026-06-09-admin-ui-design.md`

---

## File Map

```text
apps/web/src/
  features/admin/
    screens/admin-dashboard/
      admin-dashboard.screen.desktop.tsx    ← MODIFY: add Lectures card, fix Live href
      admin-dashboard.screen.mobile.tsx     ← MODIFY: same

  features/admin-lectures/
    api/admin-lectures.api.ts               ← NEW: all lecture API helpers
    hooks/use-admin-lectures.ts             ← NEW: list query hook
    components/
      AudioUploader/AudioUploader.tsx        ← NEW: file picker + R2 upload + progress
      AudioUploader/AudioUploader.spec.tsx
      LectureEditModal/LectureEditModal.tsx  ← NEW: edit form modal
      LectureEditModal/LectureEditModal.spec.tsx
      BulkActionBar/BulkActionBar.tsx        ← NEW: multi-select action bar
      BulkActionBar/BulkActionBar.spec.tsx
    screens/admin-lectures/
      admin-lectures.screen.tsx
      admin-lectures.screen.desktop.tsx     ← NEW: table + upload + bulk + drag
      admin-lectures.screen.mobile.tsx      ← NEW

  features/admin-live/
    api/admin-live.api.ts                   ← NEW
    hooks/use-admin-live.ts                 ← NEW
    components/
      ChannelForm/ChannelForm.tsx            ← NEW: create/edit channel modal
      ChannelForm/ChannelForm.spec.tsx
      SessionForm/SessionForm.tsx            ← NEW: create/edit session modal
      SessionForm/SessionForm.spec.tsx
    screens/admin-live/
      admin-live.screen.tsx
      admin-live.screen.desktop.tsx         ← NEW: Channels + Sessions tabs
      admin-live.screen.mobile.tsx          ← NEW

  features/admin-scholars/
    api/admin-scholars.api.ts               ← NEW (series + collections)
    hooks/use-admin-scholars.ts             ← NEW
    components/
      SeriesModal/SeriesModal.tsx            ← NEW
      SeriesModal/SeriesModal.spec.tsx
      CollectionModal/CollectionModal.tsx    ← NEW
      CollectionModal/CollectionModal.spec.tsx
    screens/admin-scholars/
      admin-scholars.screen.tsx             ← MODIFY: remove inline form, add Edit link
      admin-scholars.screen.desktop.tsx     ← MODIFY
      admin-scholars.screen.mobile.tsx      ← MODIFY
    screens/admin-scholar-detail/
      admin-scholar-detail.screen.tsx       ← NEW
      admin-scholar-detail.screen.desktop.tsx ← NEW: 3 sections + drag-and-drop
      admin-scholar-detail.screen.mobile.tsx  ← NEW

  app/(main)/(admin)/admin/
    lectures/page.tsx                       ← NEW
    live/page.tsx                           ← NEW (replaces livestreams/)
    scholars/[id]/page.tsx                  ← NEW
    livestreams/page.tsx                    ← DELETE (redirect to /admin/live)
```

---

## Task 1: Update Admin Dashboard

**Files:**

- Modify: `apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.desktop.tsx`
- Modify: `apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.mobile.tsx`

- [ ] **Step 1: Write a failing test for the Lectures card**

```typescript
// admin-dashboard.screen.desktop.tsx is a presentational component rendered
// conditionally by permissions. Test that Lectures appears when manage:content
// is in the permissions list.
// File: apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.spec.tsx

import { render, screen } from '@testing-library/react';
import { AdminDashboardDesktopScreen } from './admin-dashboard.screen.desktop';

jest.mock('@/features/admin/hooks/use-admin-permissions', () => ({
  useAdminPermissions: () => ({
    data: { permissions: ['manage:content', 'manage:live'] },
    isFetching: false,
  }),
}));

it('shows the Lectures card when manage:content permission is present', () => {
  render(<AdminDashboardDesktopScreen />);
  expect(screen.getByText('Lectures')).toBeInTheDocument();
});

it('links Livestreams to /admin/live', () => {
  render(<AdminDashboardDesktopScreen />);
  const liveLink = screen.getByRole('link', { name: /livestream/i });
  expect(liveLink).toHaveAttribute('href', '/admin/live');
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm --filter web test -- src/features/admin/screens/admin-dashboard/admin-dashboard.screen.spec.tsx
```

- [ ] **Step 3: Update `ADMIN_SECTIONS` in the desktop screen**

Replace the `ADMIN_SECTIONS` array in
`apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.desktop.tsx`:

```typescript
const ADMIN_SECTIONS: AdminSection[] = [
  {
    title: "Scholars",
    description: "Manage scholars, their profiles and visibility",
    href: "/admin/scholars",
    permission: "manage:scholars",
  },
  {
    title: "Lectures",
    description: "Upload audio, manage lectures, series, and collections",
    href: "/admin/lectures",
    permission: "manage:content",
  },
  {
    title: "Livestreams",
    description: "Manage live sessions and channel status",
    href: "/admin/live",
    permission: "manage:livestreams",
  },
  {
    title: "Permissions",
    description: "Manage admin user permissions",
    href: "/admin/permissions",
    permission: "manage:admin",
  },
];
```

Apply the same update to the mobile screen.

- [ ] **Step 4: Run tests**

```bash
pnpm --filter web test -- src/features/admin/screens/admin-dashboard/
```

Expected: all pass.

- [ ] **Step 5: Create the new route pages**

```typescript
// apps/web/src/app/(main)/(admin)/admin/lectures/page.tsx
import { AdminLecturesScreen } from "@/features/admin-lectures/screens/admin-lectures/admin-lectures.screen";
export default function AdminLecturesPage() { return <AdminLecturesScreen />; }
```

```typescript
// apps/web/src/app/(main)/(admin)/admin/live/page.tsx
import { AdminLiveScreen } from "@/features/admin-live/screens/admin-live/admin-live.screen";
export default function AdminLivePage() { return <AdminLiveScreen />; }
```

```typescript
// apps/web/src/app/(main)/(admin)/admin/scholars/[id]/page.tsx
import { AdminScholarDetailScreen } from "@/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen";
export default function AdminScholarDetailPage() { return <AdminScholarDetailScreen />; }
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/admin/ apps/web/src/app/
git commit -m "feat(web): update admin dashboard — add Lectures card and new route pages"
```

---

## Task 2: AudioUploader Component

**Files:**

- Create: `apps/web/src/features/admin-lectures/components/AudioUploader/AudioUploader.tsx`
- Create: `apps/web/src/features/admin-lectures/components/AudioUploader/AudioUploader.spec.tsx`
- Create: `apps/web/src/features/admin-lectures/api/admin-lectures.api.ts`

- [ ] **Step 1: Create the API helper file**

```typescript
// apps/web/src/features/admin-lectures/api/admin-lectures.api.ts
import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
  CreateLectureDto,
  AdminLectureListDto,
  AdminLectureDetailDto,
  BulkActionDto,
  BulkActionResultDto,
  AdminLectureUpdateDto,
} from "@sd/core-contracts";

export function getPresignedUrl(dto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
  return httpClient({ url: endpoints.admin.media.presignedUrl, method: "POST", body: dto });
}

export function uploadToR2(
  uploadUrl: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () =>
      xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)),
    );
    xhr.addEventListener("error", () => reject(new Error("Upload error")));
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

export function createLecture(dto: CreateLectureDto): Promise<{ id: string; title: string }> {
  return httpClient({ url: endpoints.admin.lectures.create, method: "POST", body: dto });
}

export function fetchAdminLectures(params: {
  page?: number;
  scholarId?: string;
  status?: string;
  search?: string;
}): Promise<AdminLectureListDto> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.scholarId) query.set("scholarId", params.scholarId);
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  return httpClient({ url: `${endpoints.admin.lectures.list}?${query}`, method: "GET" });
}

export function fetchAdminLectureDetail(id: string): Promise<AdminLectureDetailDto> {
  return httpClient({ url: endpoints.admin.lectures.detail(id), method: "GET" });
}

export function updateLecture(
  id: string,
  dto: AdminLectureUpdateDto,
): Promise<{ success: boolean }> {
  return httpClient({ url: endpoints.admin.lectures.update(id), method: "PUT", body: dto });
}

export function bulkLectureAction(dto: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient({ url: endpoints.admin.lectures.bulk, method: "POST", body: dto });
}
```

- [ ] **Step 2: Write failing test for AudioUploader**

```typescript
// apps/web/src/features/admin-lectures/components/AudioUploader/AudioUploader.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioUploader } from './AudioUploader';

const mockOnComplete = jest.fn();

jest.mock('../../api/admin-lectures.api', () => ({
  getPresignedUrl: jest.fn().mockResolvedValue({
    uploadUrl: 'https://r2.example.com/upload',
    publicUrl: 'https://cdn.example.com/audio/file.mp3',
    objectKey: 'audio/file.mp3',
  }),
  uploadToR2: jest.fn().mockResolvedValue(undefined),
  createLecture: jest.fn().mockResolvedValue({ id: 'new-id', title: 'file' }),
}));

it('renders the upload button', () => {
  render(<AudioUploader onComplete={mockOnComplete} />);
  expect(screen.getByText(/Upload Audio/i)).toBeInTheDocument();
});

it('calls onComplete after a successful upload', async () => {
  render(<AudioUploader onComplete={mockOnComplete} />);
  const input = screen.getByTestId('audio-file-input');
  const file = new File(['audio'], 'lecture.mp3', { type: 'audio/mpeg' });
  Object.defineProperty(file, 'size', { value: 1024 * 1024 });
  fireEvent.change(input, { target: { files: [file] } });
  // upload kicks off automatically; wait for completion
  await screen.findByText(/Upload Audio/i);
  expect(mockOnComplete).toHaveBeenCalled();
});
```

- [ ] **Step 3: Run to confirm failure**

```bash
pnpm --filter web test -- src/features/admin-lectures/components/AudioUploader/AudioUploader.spec.tsx
```

- [ ] **Step 4: Implement `AudioUploader.tsx`**

```typescript
// apps/web/src/features/admin-lectures/components/AudioUploader/AudioUploader.tsx
"use client";

import { useRef, useState } from "react";
import { getPresignedUrl, uploadToR2, createLecture } from "../../api/admin-lectures.api";

type FileState = {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

type Props = {
  onComplete: () => void;
};

// Use HTML5 <audio> element as primary — it streams metadata without loading the full file
// into memory (critical for large lectures that can be 100MB+). AudioContext.decodeAudioData
// would decompress the entire file to PCM, potentially using 1.5GB of RAM for a 200MB MP3.
async function parseAudioDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(isFinite(audio.duration) ? Math.round(audio.duration) : undefined);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(undefined);
    };
    audio.src = objectUrl;
  });
}

export function AudioUploader({ onComplete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<FileState[]>([]);

  const updateFile = (index: number, patch: Partial<FileState>) =>
    setQueue((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));

  const handleFiles = async (files: FileList) => {
    const newFiles: FileState[] = Array.from(files).map((f) => ({
      file: f,
      progress: 0,
      status: "pending",
    }));
    setQueue((prev) => [...prev, ...newFiles]);
    const offset = queue.length;

    await Promise.all(
      newFiles.map(async (entry, i) => {
        const idx = offset + i;
        try {
          updateFile(idx, { status: "uploading" });
          const durationSeconds = await parseAudioDuration(entry.file);
          const presigned = await getPresignedUrl({
            filename: entry.file.name,
            contentType: entry.file.type,
            purpose: "audio",
          });
          await uploadToR2(presigned.uploadUrl, entry.file, (pct) =>
            updateFile(idx, { progress: pct }),
          );
          await createLecture({
            title: entry.file.name.replace(/\.[^/.]+$/, ""),
            audioKey: presigned.objectKey,
            format: entry.file.type,
            sizeBytes: entry.file.size,
            durationSeconds,
          });
          updateFile(idx, { status: "done", progress: 100 });
        } catch (err) {
          updateFile(idx, {
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          });
        }
      }),
    );
    onComplete();
  };

  return (
    <div>
      <input
        data-testid="audio-file-input"
        ref={inputRef}
        type="file"
        multiple
        accept=".mp3,.m4a,audio/mpeg,audio/mp4"
        style={{ display: "none" }}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{ padding: "8px 16px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" }}
      >
        Upload Audio
      </button>
      {queue.length > 0 && (
        <ul style={{ marginTop: 16, listStyle: "none", padding: 0 }}>
          {queue.map((entry, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13 }}>{entry.file.name}</span>
                <span style={{ fontSize: 12, color: entry.status === "error" ? "#dc2626" : "#666" }}>
                  {entry.status === "error" ? entry.error : entry.status === "done" ? "Done" : `${entry.progress}%`}
                </span>
              </div>
              <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, marginTop: 4 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${entry.progress}%`,
                    background: entry.status === "error" ? "#dc2626" : "#2563eb",
                    borderRadius: 2,
                    transition: "width 0.2s",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run tests**

```bash
pnpm --filter web test -- src/features/admin-lectures/components/AudioUploader/
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/admin-lectures/
git commit -m "feat(web): add AudioUploader component with R2 direct upload and progress queue"
```

---

## Task 3: LectureEditModal Component

**Files:**

- Create: `apps/web/src/features/admin-lectures/components/LectureEditModal/LectureEditModal.tsx`
- Create: `apps/web/src/features/admin-lectures/components/LectureEditModal/LectureEditModal.spec.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// LectureEditModal.spec.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LectureEditModal } from './LectureEditModal';

jest.mock('../../api/admin-lectures.api', () => ({
  fetchAdminLectureDetail: jest.fn().mockResolvedValue({
    id: 'lec-1', title: 'Old Title', status: 'draft', scholarId: 'sc-1',
    scholarName: 'Sheikh Test', topics: [], createdAt: '2026-01-01',
  }),
  updateLecture: jest.fn().mockResolvedValue({ success: true }),
}));

it('renders with the lecture title pre-filled', async () => {
  render(<LectureEditModal lectureId="lec-1" onClose={jest.fn()} onSaved={jest.fn()} />);
  await screen.findByDisplayValue('Old Title');
});

it('calls updateLecture on save', async () => {
  const { updateLecture } = require('../../api/admin-lectures.api');
  const onSaved = jest.fn();
  render(<LectureEditModal lectureId="lec-1" onClose={jest.fn()} onSaved={onSaved} />);
  await screen.findByDisplayValue('Old Title');
  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Title' } });
  fireEvent.click(screen.getByText(/save/i));
  await waitFor(() => expect(updateLecture).toHaveBeenCalledWith('lec-1', expect.objectContaining({ title: 'New Title' })));
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm --filter web test -- src/features/admin-lectures/components/LectureEditModal/
```

- [ ] **Step 3: Implement `LectureEditModal.tsx`**

```typescript
"use client";

import { useEffect, useState } from "react";
import { fetchAdminLectureDetail, updateLecture, bulkLectureAction } from "../../api/admin-lectures.api";
import type { AdminLectureDetailDto } from "@sd/core-contracts";

type Props = {
  lectureId: string;
  onClose: () => void;
  onSaved: () => void;
};

export function LectureEditModal({ lectureId, onClose, onSaved }: Props) {
  const [lecture, setLecture] = useState<AdminLectureDetailDto | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminLectureDetail(lectureId).then((data) => {
      setLecture(data);
      setTitle(data.title);
      setDescription(data.description ?? "");
      setOrderIndex(data.orderIndex ?? "");
    });
  }, [lectureId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLecture(lectureId, {
        title,
        description: description || undefined,
        orderIndex: orderIndex !== "" ? Number(orderIndex) : undefined,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    await bulkLectureAction({ action: "publish", ids: [lectureId] });
    onSaved();
    onClose();
  };

  const handleArchive = async () => {
    await bulkLectureAction({ action: "archive", ids: [lectureId] });
    onSaved();
    onClose();
  };

  if (!lecture) return (
    <div style={overlayStyle}><div style={modalStyle}>Loading…</div></div>
  );

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 16 }}>Edit Lecture</h2>
        <label style={labelStyle}>
          Title
          <input aria-label="title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, height: 80 }} />
        </label>
        <label style={labelStyle}>
          Order Index
          <input type="number" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value === "" ? "" : Number(e.target.value))} style={inputStyle} />
        </label>
        <p style={{ fontSize: 13, color: "#666" }}>
          Status: <strong>{lecture.status}</strong>
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="button" onClick={handleSave} disabled={saving} style={primaryBtn}>
            {saving ? "Saving…" : "Save"}
          </button>
          {lecture.status !== "published" && (
            <button type="button" onClick={handlePublish} style={greenBtn}>Publish</button>
          )}
          {lecture.status !== "archived" && (
            <button type="button" onClick={handleArchive} style={redBtn}>Archive</button>
          )}
          <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex",
  alignItems: "center", justifyContent: "center", zIndex: 1000,
};
const modalStyle: React.CSSProperties = {
  background: "#fff", borderRadius: 12, padding: 24, width: 480, maxWidth: "90vw",
};
const labelStyle: React.CSSProperties = { display: "block", marginBottom: 12, fontSize: 14 };
const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", marginTop: 4, padding: 8,
  border: "1px solid #ccc", borderRadius: 4, boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = { padding: "8px 16px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" };
const greenBtn: React.CSSProperties = { ...primaryBtn, background: "#16a34a" };
const redBtn: React.CSSProperties = { ...primaryBtn, background: "#dc2626" };
const cancelBtn: React.CSSProperties = { ...primaryBtn, background: "#fff", color: "#333", border: "1px solid #ccc" };
```

- [ ] **Step 4: Run tests**

```bash
pnpm --filter web test -- src/features/admin-lectures/components/LectureEditModal/
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/admin-lectures/components/LectureEditModal/
git commit -m "feat(web): add LectureEditModal component"
```

---

## Task 4: Admin Lectures Screen

**Files:**

- Create: `apps/web/src/features/admin-lectures/screens/admin-lectures/admin-lectures.screen.tsx`
- Create: `apps/web/src/features/admin-lectures/screens/admin-lectures/admin-lectures.screen.desktop.tsx`
- Create: `apps/web/src/features/admin-lectures/screens/admin-lectures/admin-lectures.screen.mobile.tsx`
- Create: `apps/web/src/features/admin-lectures/screens/admin-lectures/admin-lectures.screen.spec.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// admin-lectures.screen.spec.tsx
import { render, screen } from '@testing-library/react';
import { AdminLecturesDesktopScreen } from './admin-lectures.screen.desktop';

jest.mock('../../api/admin-lectures.api', () => ({
  fetchAdminLectures: jest.fn().mockResolvedValue({
    items: [
      { id: '1', title: 'Lecture One', scholarName: 'Sheikh Test',
        status: 'draft', durationSeconds: 3600, createdAt: '2026-01-01' },
    ],
    total: 1, page: 1,
  }),
}));

jest.mock('@sd/core-contracts', () => ({
  useApiQuery: (_key: unknown, fetcher: () => unknown) => ({ data: fetcher(), isFetching: false, refetch: jest.fn() }),
  queryKeys: { admin: { lectures: { list: () => ['admin-lectures'] } } },
}));

it('renders lecture title in the table', async () => {
  render(<AdminLecturesDesktopScreen />);
  expect(await screen.findByText('Lecture One')).toBeInTheDocument();
});

it('renders the Upload Audio button', () => {
  render(<AdminLecturesDesktopScreen />);
  expect(screen.getByText(/Upload Audio/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm --filter web test -- src/features/admin-lectures/screens/admin-lectures/
```

- [ ] **Step 3: Implement `admin-lectures.screen.desktop.tsx`**

```typescript
"use client";

import { useState, useCallback } from "react";
import { useApiQuery, queryKeys, endpoints } from "@sd/core-contracts";
import type { AdminLectureListItemDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { AudioUploader } from "../../components/AudioUploader/AudioUploader";
import { LectureEditModal } from "../../components/LectureEditModal/LectureEditModal";
import { fetchAdminLectures, bulkLectureAction } from "../../api/admin-lectures.api";

export function AdminLecturesDesktopScreen() {
  const [page, setPage] = useState(1);
  const [scholarId, setScholarId] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { data, isFetching, refetch } = useApiQuery(
    queryKeys.admin?.lectures?.list({ page, scholarId, statusFilter, search }) ?? ["admin-lectures", page],
    () => fetchAdminLectures({ page, scholarId, status: statusFilter, search }),
  );

  const lectures = data?.items ?? [];

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(selected.size === lectures.length ? new Set() : new Set(lectures.map((l) => l.id)));

  const handleBulk = async (action: "publish" | "archive") => {
    setBulkLoading(true);
    try {
      await bulkLectureAction({ action, ids: Array.from(selected) });
      setSelected(new Set());
      refetch();
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <ScreenView>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Manage Lectures</h1>
          <AudioUploader onComplete={refetch} />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            placeholder="Search title…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4, flexGrow: 1 }}
          />
          <select value={statusFilter ?? ""} onChange={(e) => setStatusFilter(e.target.value || undefined)}
            style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4 }}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", background: "#f0f4ff", borderRadius: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 13 }}>{selected.size} selected</span>
            <button type="button" disabled={bulkLoading} onClick={() => handleBulk("publish")}
              style={{ padding: "4px 12px", borderRadius: 4, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer" }}>
              Publish selected
            </button>
            <button type="button" disabled={bulkLoading} onClick={() => handleBulk("archive")}
              style={{ padding: "4px 12px", borderRadius: 4, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer" }}>
              Archive selected
            </button>
          </div>
        )}

        {isFetching ? (
          <div style={{ textAlign: "center" }}>Loading…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>
                <th style={{ padding: 8, width: 32 }}>
                  <input type="checkbox" checked={selected.size === lectures.length && lectures.length > 0}
                    onChange={toggleAll} />
                </th>
                <th style={{ padding: 8 }}>Title</th>
                <th style={{ padding: 8 }}>Scholar</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Duration</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lectures.map((lecture) => (
                <LectureRow key={lecture.id} lecture={lecture} selected={selected.has(lecture.id)}
                  onToggle={toggleSelect} onEdit={setEditingId} />
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer" }}>
            Prev
          </button>
          <span style={{ padding: "4px 8px" }}>Page {page}</span>
          <button type="button" disabled={lectures.length < 50} onClick={() => setPage((p) => p + 1)}
            style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer" }}>
            Next
          </button>
        </div>
      </div>

      {editingId && (
        <LectureEditModal
          lectureId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={() => { refetch(); setEditingId(null); }}
        />
      )}
    </ScreenView>
  );
}

type RowProps = {
  lecture: AdminLectureListItemDto;
  selected: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
};

function LectureRow({ lecture, selected, onToggle, onEdit }: RowProps) {
  const duration = lecture.durationSeconds
    ? `${Math.floor(lecture.durationSeconds / 60)}m`
    : "—";
  return (
    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
      <td style={{ padding: 8 }}><input type="checkbox" checked={selected} onChange={() => onToggle(lecture.id)} /></td>
      <td style={{ padding: 8 }}>{lecture.title}</td>
      <td style={{ padding: 8, color: "#666" }}>{lecture.scholarName}</td>
      <td style={{ padding: 8 }}>
        <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 12,
          background: lecture.status === "published" ? "#dcfce7" : lecture.status === "archived" ? "#f3f4f6" : "#fef9c3",
          color: lecture.status === "published" ? "#16a34a" : lecture.status === "archived" ? "#666" : "#854d0e" }}>
          {lecture.status}
        </span>
      </td>
      <td style={{ padding: 8 }}>{duration}</td>
      <td style={{ padding: 8 }}>
        <button type="button" onClick={() => onEdit(lecture.id)}
          style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
          Edit
        </button>
      </td>
    </tr>
  );
}
```

- [ ] **Step 4: Create the responsive wrapper and mobile stub**

```typescript
// admin-lectures.screen.tsx
"use client";
import { Responsive } from "@/shared/components/Responsive";
import { AdminLecturesDesktopScreen } from "./admin-lectures.screen.desktop";
import { AdminLecturesMobileScreen } from "./admin-lectures.screen.mobile";
export function AdminLecturesScreen() {
  return <Responsive mobile={<AdminLecturesMobileScreen />} desktop={<AdminLecturesDesktopScreen />} />;
}
```

```typescript
// admin-lectures.screen.mobile.tsx — stub; identical UX in a single-column layout
"use client";
import { AdminLecturesDesktopScreen } from "./admin-lectures.screen.desktop";
export function AdminLecturesMobileScreen() { return <AdminLecturesDesktopScreen />; }
```

- [ ] **Step 5: Run tests**

```bash
pnpm --filter web test -- src/features/admin-lectures/
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/admin-lectures/ apps/web/src/app/
git commit -m "feat(web): add admin lectures screen with upload, list, edit modal, bulk actions"
```

---

## Task 5: Admin Live Screen (Channels + Sessions)

**Files:**

- Create: `apps/web/src/features/admin-live/api/admin-live.api.ts`
- Create: `apps/web/src/features/admin-live/screens/admin-live/admin-live.screen.tsx`
- Create: `apps/web/src/features/admin-live/screens/admin-live/admin-live.screen.desktop.tsx`
- Create: `apps/web/src/features/admin-live/screens/admin-live/admin-live.screen.mobile.tsx`
- Create: `apps/web/src/features/admin-live/screens/admin-live/admin-live.screen.spec.tsx`

- [ ] **Step 1: Create the API helper**

```typescript
// apps/web/src/features/admin-live/api/admin-live.api.ts
import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  LivestreamChannelDto,
  CreateLivestreamChannelDto,
  UpdateLivestreamChannelDto,
  CreateLiveSessionDto,
  UpdateLiveSessionDto,
  LiveSessionDeltaDto,
  LiveSessionStatus,
} from "@sd/core-contracts";

export const fetchAdminChannels = (): Promise<{ channels: LivestreamChannelDto[] }> =>
  httpClient({ url: endpoints.admin.live.listChannels, method: "GET" });

export const createChannel = (dto: CreateLivestreamChannelDto) =>
  httpClient({ url: endpoints.admin.live.createChannel, method: "POST", body: dto });

export const updateChannel = (id: string, dto: UpdateLivestreamChannelDto) =>
  httpClient({ url: endpoints.admin.live.updateChannel(id), method: "PUT", body: dto });

export const createSession = (dto: CreateLiveSessionDto) =>
  httpClient({ url: endpoints.admin.live.createSession, method: "POST", body: dto });

export const updateSession = (id: string, dto: UpdateLiveSessionDto) =>
  httpClient({ url: endpoints.admin.live.updateSession(id), method: "PUT", body: dto });

export const updateSessionStatus = (id: string, status: LiveSessionStatus) =>
  httpClient({ url: endpoints.admin.live.updateStatus(id), method: "PATCH", body: { status } });

export const fetchActiveSessions = (): Promise<LiveSessionDeltaDto> =>
  httpClient({ url: endpoints.live.active, method: "GET" });

export const fetchScheduledSessions = (): Promise<LiveSessionDeltaDto> =>
  httpClient({ url: endpoints.live.upcoming, method: "GET" });

export const fetchEndedSessions = (): Promise<LiveSessionDeltaDto> =>
  httpClient({ url: endpoints.live.ended, method: "GET" });
```

- [ ] **Step 2: Write failing test**

```typescript
// admin-live.screen.spec.tsx
import { render, screen } from '@testing-library/react';
import { AdminLiveDesktopScreen } from './admin-live.screen.desktop';

jest.mock('../../api/admin-live.api', () => ({
  fetchAdminChannels: jest.fn().mockResolvedValue({ channels: [
    { id: 'c1', displayName: 'Test Channel', isActive: true, createdAt: '', updatedAt: '' },
  ]}),
  fetchActiveSessions: jest.fn().mockResolvedValue({ sessions: [], deletedIds: [], fetchedAt: '' }),
  fetchScheduledSessions: jest.fn().mockResolvedValue({ sessions: [], deletedIds: [], fetchedAt: '' }),
  fetchEndedSessions: jest.fn().mockResolvedValue({ sessions: [], deletedIds: [], fetchedAt: '' }),
}));

it('renders Sessions and Channels tabs', () => {
  render(<AdminLiveDesktopScreen />);
  expect(screen.getByText('Sessions')).toBeInTheDocument();
  expect(screen.getByText('Channels')).toBeInTheDocument();
});
```

- [ ] **Step 3: Run to confirm failure**

```bash
pnpm --filter web test -- src/features/admin-live/screens/admin-live/
```

- [ ] **Step 4: Implement `admin-live.screen.desktop.tsx`**

The screen has two tabs: Sessions (default) and Channels. Sessions tab preserves the existing
status-change table from `admin-livestreams.screen.desktop.tsx` and adds a "New Session" button
that opens an inline form. Channels tab lists channels with "New Channel" and "Edit" buttons.

```typescript
"use client";

import { useState } from "react";
import { useApiQuery, queryKeys, endpoints, httpClient } from "@sd/core-contracts";
import type { LivestreamChannelDto, LiveSessionPublicDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import {
  fetchAdminChannels, fetchActiveSessions, fetchScheduledSessions, fetchEndedSessions,
  createChannel, updateChannel, createSession, updateSessionStatus,
} from "../../api/admin-live.api";

type Tab = "sessions" | "channels";

const HELPER_TEXT: Record<string, string> = {
  telegramId: "The numeric channel ID from Telegram (e.g. -1001234567890). Find it by forwarding a message from the channel to @userinfobot.",
  displayName: "The name shown to users in the app. Can differ from the Telegram channel name.",
  telegramSlug: "The channel's public username without the @ (e.g. duruschannel). Leave blank if the channel is private.",
};

export function AdminLiveDesktopScreen() {
  const [tab, setTab] = useState<Tab>("sessions");

  return (
    <ScreenView>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Manage Livestreams</h1>
        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #e0e0e0" }}>
          {(["sessions", "channels"] as Tab[]).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              style={{ padding: "8px 20px", border: "none", background: "none", cursor: "pointer",
                borderBottom: tab === t ? "2px solid #2563eb" : "2px solid transparent",
                color: tab === t ? "#2563eb" : "#666", fontWeight: tab === t ? 600 : 400,
                marginBottom: -2, textTransform: "capitalize" }}>
              {t}
            </button>
          ))}
        </div>
        {tab === "sessions" ? <SessionsTab /> : <ChannelsTab />}
      </div>
    </ScreenView>
  );
}

// ── Sessions Tab ────────────────────────────────────────────────────────────

function SessionsTab() {
  const { data: active, refetch: ra } = useApiQuery(["live", "active"], fetchActiveSessions);
  const { data: scheduled, refetch: rs } = useApiQuery(["live", "scheduled"], fetchScheduledSessions);
  const { data: ended, refetch: re } = useApiQuery(["live", "ended"], fetchEndedSessions);
  const [showNewSession, setShowNewSession] = useState(false);
  const refetchAll = () => { ra(); rs(); re(); };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => setShowNewSession(true)}
          style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>
          + New Session
        </button>
      </div>
      {showNewSession && (
        <NewSessionForm channels={[]} onSaved={() => { setShowNewSession(false); refetchAll(); }} onCancel={() => setShowNewSession(false)} />
      )}
      {[
        { label: "Active", color: "#16a34a", sessions: active?.sessions ?? [] },
        { label: "Scheduled", color: "#2563eb", sessions: scheduled?.sessions ?? [] },
        { label: "Ended", color: "#666", sessions: ended?.sessions ?? [] },
      ].map(({ label, color, sessions }) => (
        <div key={label} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color, marginBottom: 12 }}>{label} ({sessions.length})</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>
                {["Title", "Channel", "Scholar", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: 8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: 8 }}>{s.title ?? "Untitled"}</td>
                  <td style={{ padding: 8 }}>{s.channelDisplayName}</td>
                  <td style={{ padding: 8 }}>{s.scholarName ?? "—"}</td>
                  <td style={{ padding: 8 }}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: 8 }}>
                    <SessionActions session={s} onChanged={refetchAll} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    live: { bg: "#dcfce7", text: "#16a34a" },
    scheduled: { bg: "#dbeafe", text: "#2563eb" },
    ended: { bg: "#f3f4f6", text: "#666" },
  };
  const c = colors[status] ?? colors.ended;
  return (
    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 12, background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

function SessionActions({ session, onChanged }: { session: LiveSessionPublicDto; onChanged: () => void }) {
  const handle = async (status: string) => {
    await updateSessionStatus(session.id, status as "live" | "scheduled" | "ended");
    onChanged();
  };
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {session.status === "scheduled" && <Btn label="Go Live" bg="#16a34a" onClick={() => handle("live")} />}
      {session.status === "live" && <Btn label="End" bg="#dc2626" onClick={() => handle("ended")} />}
      {session.status === "ended" && <Btn label="Reschedule" bg="#fff" color="#333" border onClick={() => handle("scheduled")} />}
    </div>
  );
}

function Btn({ label, bg, color = "#fff", border = false, onClick }: {
  label: string; bg: string; color?: string; border?: boolean; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: "4px 8px", borderRadius: 4, border: border ? "1px solid #ccc" : "none", background: bg, color, cursor: "pointer", fontSize: 12 }}>
      {label}
    </button>
  );
}

function NewSessionForm({ channels, onSaved, onCancel }: {
  channels: LivestreamChannelDto[]; onSaved: () => void; onCancel: () => void;
}) {
  const [channelId, setChannelId] = useState("");
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!channelId) return;
    setSaving(true);
    try {
      await createSession({ channelId, title: title || undefined, scheduledAt: scheduledAt || undefined });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 16, border: "1px solid #e0e0e0", borderRadius: 8, marginBottom: 16 }}>
      <h3 style={{ marginBottom: 12 }}>New Session</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <input placeholder="Channel ID (required)" value={channelId} onChange={(e) => setChannelId(e.target.value)} style={inputStyle} />
        <input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button type="button" onClick={handleSave} disabled={saving || !channelId}
          style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>
          {saving ? "Saving…" : "Create"}
        </button>
        <button type="button" onClick={onCancel}
          style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Channels Tab ────────────────────────────────────────────────────────────

function ChannelsTab() {
  const { data, isFetching, refetch } = useApiQuery(["admin", "live", "channels"], fetchAdminChannels);
  const [editing, setEditing] = useState<LivestreamChannelDto | null>(null);
  const [creating, setCreating] = useState(false);

  const channels = (data as { channels?: LivestreamChannelDto[] })?.channels ?? [];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button type="button" onClick={() => { setCreating(true); setEditing(null); }}
          style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>
          + New Channel
        </button>
      </div>

      {(creating || editing) && (
        <ChannelForm initial={editing ?? undefined} onSaved={() => { setCreating(false); setEditing(null); refetch(); }}
          onCancel={() => { setCreating(false); setEditing(null); }} />
      )}

      {isFetching ? <div>Loading…</div> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e0e0e0", textAlign: "left" }}>
              {["Display Name", "Telegram Slug", "Scholar", "Language", "Active", "Actions"].map((h) => (
                <th key={h} style={{ padding: 8 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.map((ch) => (
              <tr key={ch.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 8 }}>{ch.displayName}</td>
                <td style={{ padding: 8, color: "#666" }}>@{ch.telegramSlug ?? "—"}</td>
                <td style={{ padding: 8 }}>{ch.scholarName ?? "—"}</td>
                <td style={{ padding: 8 }}>{ch.language ?? "—"}</td>
                <td style={{ padding: 8 }}>{ch.isActive ? "Yes" : "No"}</td>
                <td style={{ padding: 8 }}>
                  <button type="button" onClick={() => { setEditing(ch); setCreating(false); }}
                    style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ChannelForm({ initial, onSaved, onCancel }: {
  initial?: LivestreamChannelDto; onSaved: () => void; onCancel: () => void;
}) {
  const [telegramId, setTelegramId] = useState("");
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [telegramSlug, setTelegramSlug] = useState(initial?.telegramSlug ?? "");
  const [language, setLanguage] = useState(initial?.language ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (initial) {
        await updateChannel(initial.id, { displayName, telegramSlug: telegramSlug || undefined, language: language as "en" | "ar" || undefined, isActive });
      } else {
        await createChannel({ telegramId, displayName, telegramSlug: telegramSlug || undefined, language: language as "en" | "ar" || undefined });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 16, border: "1px solid #e0e0e0", borderRadius: 8, marginBottom: 24 }}>
      <h3 style={{ marginBottom: 16 }}>{initial ? "Edit Channel" : "New Channel"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {!initial && (
          <Field label="Telegram ID *" help={HELPER_TEXT.telegramId}>
            <input value={telegramId} onChange={(e) => setTelegramId(e.target.value)} style={inputStyle} />
          </Field>
        )}
        <Field label="Display Name *" help={HELPER_TEXT.displayName}>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Telegram Slug" help={HELPER_TEXT.telegramSlug}>
          <input value={telegramSlug} onChange={(e) => setTelegramSlug(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Language">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={inputStyle}>
            <option value="">—</option>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </Field>
        {initial && (
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button type="button" onClick={handleSave} disabled={saving || !displayName}
          style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer" }}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel}
          style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>{label}</label>
      {children}
      {help && <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>{help}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%", padding: "8px 10px",
  border: "1px solid #ccc", borderRadius: 4, boxSizing: "border-box",
};
```

- [ ] **Step 5: Create wrapper and mobile stub**

```typescript
// admin-live.screen.tsx
"use client";
import { Responsive } from "@/shared/components/Responsive";
import { AdminLiveDesktopScreen } from "./admin-live.screen.desktop";
import { AdminLiveMobileScreen } from "./admin-live.screen.mobile";
export function AdminLiveScreen() {
  return <Responsive mobile={<AdminLiveMobileScreen />} desktop={<AdminLiveDesktopScreen />} />;
}
```

```typescript
// admin-live.screen.mobile.tsx
"use client";
import { AdminLiveDesktopScreen } from "./admin-live.screen.desktop";
export function AdminLiveMobileScreen() { return <AdminLiveDesktopScreen />; }
```

- [ ] **Step 6: Run tests**

```bash
pnpm --filter web test -- src/features/admin-live/
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/admin-live/ apps/web/src/app/
git commit -m "feat(web): add admin live screen with channels tab and enhanced sessions tab"
```

---

## Task 6: Admin Scholars Detail Screen (Series + Collections)

**Files:**

- Create: `apps/web/src/features/admin-scholars/api/admin-scholars.api.ts`
- Create: `apps/web/src/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen.tsx`
- Create: `apps/web/src/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen.desktop.tsx`
- Create: `apps/web/src/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen.mobile.tsx`
- Create: `apps/web/src/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen.spec.tsx`
- Modify: `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.desktop.tsx`

- [ ] **Step 1: Create API helper**

```typescript
// apps/web/src/features/admin-scholars/api/admin-scholars.api.ts
import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  AdminSeriesListItemDto,
  AdminSeriesDetailDto,
  CreateSeriesDto,
  UpdateSeriesDto,
  AdminCollectionListItemDto,
  AdminCollectionDetailDto,
  CreateCollectionDto,
  UpdateCollectionDto,
  BulkActionDto,
  BulkActionResultDto,
} from "@sd/core-contracts";

export const fetchAdminSeries = (scholarId: string): Promise<AdminSeriesListItemDto[]> =>
  httpClient({ url: `${endpoints.admin.series.list}?scholarId=${scholarId}`, method: "GET" });

export const fetchAdminSeriesDetail = (id: string): Promise<AdminSeriesDetailDto> =>
  httpClient({ url: endpoints.admin.series.detail(id), method: "GET" });

export const createSeries = (dto: CreateSeriesDto) =>
  httpClient({ url: endpoints.admin.series.create, method: "POST", body: dto });

export const updateSeries = (id: string, dto: UpdateSeriesDto) =>
  httpClient({ url: endpoints.admin.series.update(id), method: "PATCH", body: dto });

export const publishSeries = (id: string) =>
  httpClient({ url: endpoints.admin.series.publish(id), method: "POST" });

export const archiveSeries = (id: string) =>
  httpClient({ url: endpoints.admin.series.archive(id), method: "POST" });

export const bulkSeriesAction = (dto: BulkActionDto): Promise<BulkActionResultDto> =>
  httpClient({ url: endpoints.admin.series.bulk, method: "POST", body: dto });

export const fetchAdminCollections = (scholarId: string): Promise<AdminCollectionListItemDto[]> =>
  httpClient({ url: `${endpoints.admin.collections.list}?scholarId=${scholarId}`, method: "GET" });

export const createCollection = (dto: CreateCollectionDto) =>
  httpClient({ url: endpoints.admin.collections.create, method: "POST", body: dto });

export const updateCollection = (id: string, dto: UpdateCollectionDto) =>
  httpClient({ url: endpoints.admin.collections.update(id), method: "PATCH", body: dto });

export const publishCollection = (id: string) =>
  httpClient({ url: endpoints.admin.collections.publish(id), method: "POST" });

export const archiveCollection = (id: string) =>
  httpClient({ url: endpoints.admin.collections.archive(id), method: "POST" });

export const bulkCollectionAction = (dto: BulkActionDto): Promise<BulkActionResultDto> =>
  httpClient({ url: endpoints.admin.collections.bulk, method: "POST", body: dto });
```

- [ ] **Step 2: Write failing test**

```typescript
// admin-scholar-detail.screen.spec.tsx
import { render, screen } from '@testing-library/react';
import { AdminScholarDetailDesktopScreen } from './admin-scholar-detail.screen.desktop';

jest.mock('next/navigation', () => ({ useParams: () => ({ id: 'scholar-1' }) }));
jest.mock('../../../features/admin-scholars/api/admin-scholars.api', () => ({
  fetchAdminSeries: jest.fn().mockResolvedValue([
    { id: 's1', title: 'Tawheed Series', status: 'published', publishedLectureCount: 10, orderIndex: 1 },
  ]),
  fetchAdminCollections: jest.fn().mockResolvedValue([]),
}));

it('renders Scholar Info, Series, and Collections sections', () => {
  render(<AdminScholarDetailDesktopScreen />);
  expect(screen.getByText(/Scholar Info/i)).toBeInTheDocument();
  expect(screen.getByText(/Series/i)).toBeInTheDocument();
  expect(screen.getByText(/Collections/i)).toBeInTheDocument();
});
```

- [ ] **Step 3: Implement `admin-scholar-detail.screen.desktop.tsx`**

The screen has three sections: Scholar Info (edit form), Series (list + drag-and-drop +
bulk + modals), Collections (same pattern). Drag-and-drop uses the HTML5 `draggable` attribute
with `onDragStart` / `onDrop` to reorder rows and then calls `updateSeries` with the new
`orderIndex`.

Create the file at:
`apps/web/src/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen.desktop.tsx`

Key structure:

```typescript
"use client";

import { useParams } from "next/navigation";
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type {
  ScholarListItemDto,
  AdminSeriesListItemDto,
  AdminCollectionListItemDto,
} from "@sd/core-contracts";
import { useState, useRef } from "react";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { updateScholar } from "@/features/admin/api/admin.api";
import {
  fetchAdminSeries,
  fetchAdminCollections,
  createSeries,
  updateSeries,
  publishSeries,
  archiveSeries,
  bulkSeriesAction,
  createCollection,
  updateCollection,
  publishCollection,
  archiveCollection,
  bulkCollectionAction,
} from "../../api/admin-scholars.api";

// Scholar Info section: fetches scholar by id via GET /scholars list + find by id,
// renders edit form with name, slug, bio, imageUrl, isKibar, isFeatured, isActive.
// Save calls updateScholar (existing API helper).

// SeriesSection: fetches fetchAdminSeries(scholarId), renders list with drag handles.
// Drag-and-drop: onDragStart stores dragged index, onDrop calculates new orderIndex
// (position in array) and calls updateSeries with { orderIndex: newIndex }.
// Optimistic update: reorder local state immediately, revert on API error.

// CollectionsSection: same pattern as SeriesSection with collection API calls.

// Both sections have:
//   - multi-select checkboxes + bulk bar (publish/archive selected)
//   - "New" button → modal form
//   - "Edit" button per row → modal form pre-populated
//   - inline "Publish" / "Archive" toggle per row
```

Implement the full component following the patterns established in Tasks 2–5. The drag-and-drop
implementation:

```typescript
// Drag state refs
const dragIndex = useRef<number | null>(null);

// On table row:
<tr
  draggable
  onDragStart={() => { dragIndex.current = index; }}
  onDragOver={(e) => e.preventDefault()}
  onDrop={async () => {
    const from = dragIndex.current;
    if (from === null || from === index) return;
    // Optimistically reorder
    const reordered = [...seriesList];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(index, 0, moved);
    setSeriesList(reordered);
    dragIndex.current = null;
    try {
      await updateSeries(moved.id, { orderIndex: index });
    } catch {
      // Revert on failure
      refetchSeries();
    }
  }}
  style={{ cursor: "grab", borderBottom: "1px solid #f0f0f0" }}
>
```

- [ ] **Step 4: Create the wrapper and mobile stub**

```typescript
// admin-scholar-detail.screen.tsx
"use client";
import { Responsive } from "@/shared/components/Responsive";
import { AdminScholarDetailDesktopScreen } from "./admin-scholar-detail.screen.desktop";
import { AdminScholarDetailMobileScreen } from "./admin-scholar-detail.screen.mobile";
export function AdminScholarDetailScreen() {
  return <Responsive mobile={<AdminScholarDetailMobileScreen />} desktop={<AdminScholarDetailDesktopScreen />} />;
}
```

- [ ] **Step 5: Update admin-scholars list screen to link to detail page**

In `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.desktop.tsx`,
replace the inline edit form with a link to the detail page:

```typescript
// In the actions column, replace the Edit button inline form with:
<a href={`/admin/scholars/${s.id}`}
  style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #ccc", background: "#fff",
    textDecoration: "none", color: "inherit", cursor: "pointer" }}>
  Edit
</a>
```

Remove the `editing`, `creating`, `formData`, `saving` state and `handleSave` function —
the inline form is gone.

- [ ] **Step 6: Run tests**

```bash
pnpm --filter web test -- src/features/admin-scholars/
```

- [ ] **Step 7: Final typecheck and test run**

```bash
pnpm typecheck:api+web
pnpm test:api+web
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/features/admin-scholars/ apps/web/src/features/admin/
git commit -m "feat(web): add scholar detail page with series and collections management"
```

---

## Final Validation

- [ ] Start the web dev server: `pnpm dev:web`
- [ ] Verify admin dashboard shows Scholars, Lectures, Livestreams, Permissions cards
- [ ] Navigate to `/admin/lectures` — confirm table loads and Upload Audio button works
- [ ] Navigate to `/admin/live` — confirm Sessions and Channels tabs are present
- [ ] Navigate to `/admin/scholars` — confirm Edit links navigate to detail page
- [ ] Navigate to `/admin/scholars/[id]` — confirm three sections render

Plan 2 complete. Plan 3 (Native UI) can be implemented in parallel.
