# Admin UI — Plan 3: Native Admin UI

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents
> available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`)
> syntax for tracking.

**Goal:** Build the native admin UI — permission-gated entry point in the Account tab, admin
dashboard, and admin screens for lectures (with file upload), live (channels + sessions), and
scholars (with series/collections + drag-and-drop reordering) — in `apps/native`.

**Architecture:** New feature folders (`admin`, `admin-lectures`, `admin-live`, `admin-scholars`)
under `apps/native/src/features/`. Routing lives under `(tabs)/account/(admin)/` as a nested
stack. The Account screen gains a permission-gated "Admin" card that navigates into this stack.
All data fetching uses `useApiQuery(key, () => httpClient({ url, method }))` from
`@sd/core-contracts`. Mutations call `httpClient({ url, method, body })` directly then `refetch`.
Bottom sheets are implemented as absolute-positioned overlay `View`s. Drag-and-drop uses
`react-native-draggable-flatlist`.

**Tech Stack:** Expo Router, React Native, `@sd/core-contracts`, `react-hook-form`,
`react-native-draggable-flatlist`, `expo-document-picker`, `expo-file-system`,
`@shopify/flash-list`, `react-native-unistyles`, Jest + react-test-renderer.

**Prereq:** Plan 1 (API & Contracts) must be complete. The following additions from Plan 1 are
**required** before any code in this plan can compile:

**New DTOs (added to `packages/core-contracts/src/types/` in Plan 1):**

- `PresignedUrlRequestDto` — `{ filename: string; contentType: string; purpose: "audio" | "image" }`
- `PresignedUrlResponseDto` — `{ uploadUrl: string; publicUrl: string; objectKey: string }`
- `CreateLectureDto` — `{ title: string; slug?: string; scholarId?: string; seriesId?: string; topics?: string[]; audioKey: string; format?: string; durationSeconds?: number; sizeBytes?: number }`
- `AdminLectureListItemDto` — `{ id: string; title: string; scholarName?: string; status: string; durationSeconds?: number; createdAt: string }`
- `AdminLectureListDto` — `{ items: AdminLectureListItemDto[]; total: number; page: number }`
- `AdminLectureDetailDto` — full lecture fields for edit form, includes `audioKey`
- `BulkActionDto` — `{ action: "publish" | "archive"; ids: string[] }`
- `BulkActionResultDto` — `{ succeeded: string[]; failed: string[] }`

Note: `AdminLectureUpdateDto` is **already present** in `packages/core-contracts/src/types/lecture.types.ts`
and does not need to be added by Plan 1.

- `AdminSeriesListItemDto` — `{ id: string; title: string; status: string; publishedLectureCount?: number; orderIndex?: number }`
- `AdminSeriesDetailDto` — `{ id: string; scholarId: string; title: string; description?: string; coverImageUrl?: string; language?: string; status: string; orderIndex?: number }`
- `CreateSeriesDto` — `{ scholarId: string; title: string; description?: string; coverImageUrl?: string; language?: string; orderIndex?: number }`
- `UpdateSeriesDto` — all fields optional
- `AdminCollectionListItemDto` — same shape as `AdminSeriesListItemDto`
- `AdminCollectionDetailDto` — same shape as `AdminSeriesDetailDto`
- `CreateCollectionDto` — same shape as `CreateSeriesDto`
- `UpdateCollectionDto` — all fields optional

**New endpoint entries (added to `endpoints.ts` in Plan 1):**

```typescript
admin: {
  lectures: { list, detail(id), create, update(id), publish(id), archive(id), bulk },
  series:   { list, detail(id), create, update(id), publish(id), archive(id), bulk },
  collections: { list, detail(id), create, update(id), publish(id), archive(id), bulk },
  media:    { presignedUrl },
  live: {
    listSessions: "/admin/live/sessions",
    listChannels, createChannel, updateChannel(id),
    createSession, updateSession(id), updateStatus(id),
  },
  // existing: permissions.me, scholars.create/update, topics.*, lectures.update/publish/archive
}
```

**Spec:** `.agents/plans/2026-06-09-admin-ui-design.md`

---

## File Map

```text
apps/native/src/
  features/account/
    screens/account.screen.tsx                   ← MODIFY: add Admin card (permission-gated)
    screens/account.screen.spec.tsx              ← MODIFY: add Admin card tests

  features/admin/
    api/admin-permissions.api.ts                 ← NEW: fetch /admin/permissions/me
    hooks/use-admin-permissions.ts               ← NEW: caches permission list for session
    screens/admin-dashboard/
      admin-dashboard.screen.tsx                 ← NEW: card grid (Scholars, Lectures, Live, Permissions)
      admin-dashboard.screen.spec.tsx            ← NEW

  features/admin-lectures/
    api/admin-lectures.api.ts                    ← NEW: presigned URL, R2 upload, lecture CRUD, bulk
    hooks/use-admin-lectures.ts                  ← NEW: list query hook
    components/
      AudioUploaderSheet/AudioUploaderSheet.tsx  ← NEW: file picker + upload queue overlay sheet
      AudioUploaderSheet/AudioUploaderSheet.spec.tsx
      LectureEditSheet/LectureEditSheet.tsx      ← NEW: edit form overlay sheet
      LectureEditSheet/LectureEditSheet.spec.tsx
      BulkActionBar/BulkActionBar.tsx            ← NEW: multi-select sticky bar
      BulkActionBar/BulkActionBar.spec.tsx
    screens/admin-lectures/
      admin-lectures.screen.tsx                  ← NEW: FlashList + upload + edit + bulk + selection

  features/admin-live/
    api/admin-live.api.ts                        ← NEW: channels + sessions CRUD
    hooks/use-admin-live.ts                      ← NEW
    components/
      ChannelSheet/ChannelSheet.tsx              ← NEW: create/edit channel overlay sheet
      ChannelSheet/ChannelSheet.spec.tsx
      SessionSheet/SessionSheet.tsx              ← NEW: create/edit session overlay sheet
      SessionSheet/SessionSheet.spec.tsx
    screens/admin-live/
      admin-live.screen.tsx                      ← NEW: Sessions section + Channels section

  features/admin-scholars/
    api/admin-scholars.api.ts                    ← NEW: series + collections CRUD + bulk
    hooks/use-admin-scholars.ts                  ← NEW: series + collections list hooks
    components/
      SeriesSheet/SeriesSheet.tsx                ← NEW: create/edit series overlay sheet
      SeriesSheet/SeriesSheet.spec.tsx
      CollectionSheet/CollectionSheet.tsx        ← NEW: create/edit collection overlay sheet
      CollectionSheet/CollectionSheet.spec.tsx
    screens/admin-scholars/
      admin-scholars.screen.tsx                  ← NEW: scholars list
    screens/admin-scholar-detail/
      admin-scholar-detail.screen.tsx            ← NEW: 3 sections + draggable-flatlist

  app/(tabs)/account/
    _layout.tsx                                  ← MODIFY: expose (admin) group
    (admin)/
      _layout.tsx                                ← NEW: Stack layout for admin
      index.tsx                                  ← NEW: admin dashboard route
      lectures/index.tsx                         ← NEW: lectures route
      live/index.tsx                             ← NEW: live route
      scholars/index.tsx                         ← NEW: scholars list route
      scholars/[slug].tsx                        ← NEW: scholar detail route (keyed by slug)
```

---

## Task 1: Install Dependencies

**Files:**

- Modify: `apps/native/package.json` (via pnpm)

- [ ] **Step 1: Add new native dependencies**

```bash
pnpm --filter native add react-native-draggable-flatlist expo-document-picker expo-file-system
```

Note: `react-native-draggable-flatlist` requires `react-native-gesture-handler` and
`react-native-reanimated` — both already installed in this project.

- [ ] **Step 2: Verify packages resolve**

```bash
pnpm --filter native typecheck
```

Expected: no new errors from missing modules. (Feature files don't exist yet.)

- [ ] **Step 3: Commit**

```bash
git add apps/native/package.json pnpm-lock.yaml
git commit -m "chore(native): add draggable-flatlist, document-picker, file-system deps"
```

---

## Task 2: Admin Permissions Hook

**Files:**

- Create: `apps/native/src/features/admin/api/admin-permissions.api.ts`
- Create: `apps/native/src/features/admin/hooks/use-admin-permissions.ts`
- Create: `apps/native/src/features/admin/hooks/use-admin-permissions.spec.ts`

The hook calls `GET /admin/permissions/me` once per session. The Account screen and dashboard
read the cached result to decide which cards to show.

- [ ] **Step 1: Write the failing test**

```typescript
// apps/native/src/features/admin/hooks/use-admin-permissions.spec.ts
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useAdminPermissions } from './use-admin-permissions';

jest.mock('@sd/core-contracts', () => ({
  useApiQuery: jest.fn(),
  httpClient: jest.fn(),
  endpoints: { admin: { permissions: { me: '/admin/permissions/me' } } },
}));

// Render hook via a wrapper component — matches the native test pattern
function HookWrapper({ onResult }: { onResult: (r: ReturnType<typeof useAdminPermissions>) => void }) {
  onResult(useAdminPermissions());
  return null;
}

const { useApiQuery } = require('@sd/core-contracts');

describe('useAdminPermissions', () => {
  it('returns hasAnyPermission=false when permissions list is empty', () => {
    useApiQuery.mockReturnValue({ data: { permissions: [] }, isLoading: false });

    let result!: ReturnType<typeof useAdminPermissions>;
    act(() => { renderer.create(<HookWrapper onResult={(r) => { result = r; }} />); });
    expect(result.hasAnyPermission).toBe(false);
  });

  it('returns hasAnyPermission=true when user has at least one permission', () => {
    useApiQuery.mockReturnValue({
      data: { permissions: [{ permission: 'manage:content', grantedAt: '2026-01-01' }] },
      isLoading: false,
    });

    let result!: ReturnType<typeof useAdminPermissions>;
    act(() => { renderer.create(<HookWrapper onResult={(r) => { result = r; }} />); });
    expect(result.hasAnyPermission).toBe(true);
    expect(result.hasPermission('manage:content')).toBe(true);
    expect(result.hasPermission('manage:admin')).toBe(false);
  });
});
```

Run: `pnpm --filter native test use-admin-permissions`
Expected: FAIL — module not found

- [ ] **Step 2: Create the API helper**

```typescript
// apps/native/src/features/admin/api/admin-permissions.api.ts
import { httpClient, endpoints } from "@sd/core-contracts";
import type { AdminPermissionsListDto } from "@sd/core-contracts";

export async function fetchAdminPermissions(): Promise<AdminPermissionsListDto> {
  return httpClient<AdminPermissionsListDto>({
    url: endpoints.admin.permissions.me,
    method: "GET",
  });
}
```

- [ ] **Step 3: Create the hook**

```typescript
// apps/native/src/features/admin/hooks/use-admin-permissions.ts
import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { AdminPermissionsListDto } from "@sd/core-contracts";

export function useAdminPermissions() {
  const query = useApiQuery<AdminPermissionsListDto>(
    ["admin", "permissions", "me"],
    () =>
      httpClient<AdminPermissionsListDto>({ url: endpoints.admin.permissions.me, method: "GET" }),
    { staleTime: Infinity }, // cache for session lifetime
  );

  const permissions = query.data?.permissions ?? [];
  const hasAnyPermission = permissions.length > 0;
  const hasPermission = (perm: string) => permissions.some((p) => p.permission === perm);

  return {
    permissions,
    hasAnyPermission,
    hasPermission,
    isLoading: query.isLoading,
  };
}
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
pnpm --filter native test use-admin-permissions
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/native/src/features/admin/
git commit -m "feat(native-admin): admin permissions hook"
```

---

## Task 3: Account Screen — Admin Card

**Files:**

- Modify: `apps/native/src/features/account/screens/account.screen.tsx`
- Modify: `apps/native/src/features/account/screens/account.screen.spec.tsx`

The Account screen gains an "Admin" `Pressable` card rendered only when `hasAnyPermission` is
true. It accepts a new `onNavigateToAdmin?: () => void` prop (matches the existing prop pattern).
All user-visible strings are wrapped with `t()` to match the established pattern in this file.

- [ ] **Step 1: Write the failing test**

Add to `account.screen.spec.tsx` (within the existing `describe` block):

```typescript
// Add to top of file:
import { useAdminPermissions } from '@/features/admin/hooks/use-admin-permissions';

jest.mock('@/features/admin/hooks/use-admin-permissions', () => ({
  useAdminPermissions: jest.fn(),
}));

const mockedUseAdminPermissions = jest.mocked(useAdminPermissions);

// In beforeEach, add:
mockedUseAdminPermissions.mockReturnValue({
  hasAnyPermission: false,
  permissions: [],
  hasPermission: jest.fn(),
  isLoading: false,
});

// New tests:
it('shows Admin card when user has at least one admin permission', () => {
  mockedUseAccountScreen.mockReturnValue({
    profile: { id: 'u1', email: 'a@b.com', displayName: 'A', role: 'user',
      emailVerified: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    isFetching: false, error: null,
  });
  mockedUseAdminPermissions.mockReturnValue({
    hasAnyPermission: true, permissions: [], hasPermission: jest.fn(), isLoading: false,
  });

  let tree: ReturnType<typeof renderer.create>;
  act(() => { tree = renderer.create(<AccountScreen onNavigateToAdmin={() => {}} />); });
  expect(JSON.stringify(tree!.toJSON())).toContain('Admin');
});

it('hides Admin card when user has no admin permissions', () => {
  mockedUseAdminPermissions.mockReturnValue({
    hasAnyPermission: false, permissions: [], hasPermission: jest.fn(), isLoading: false,
  });

  let tree: ReturnType<typeof renderer.create>;
  act(() => { tree = renderer.create(<AccountScreen />); });
  // No Admin pressable in the output — only account title should appear
  const json = tree!.toJSON() as any[];
  // Flatten and check: "Admin" as a standalone label should not appear
  expect(JSON.stringify(json)).not.toContain('"Admin"');
});
```

Run: `pnpm --filter native test account.screen`
Expected: FAIL — `useAdminPermissions` not imported in screen

- [ ] **Step 2: Add the Admin card to account.screen.tsx**

In `account.screen.tsx`:

1. Import `useAdminPermissions` from `@/features/admin/hooks/use-admin-permissions`
2. Add `onNavigateToAdmin?: () => void` to `AccountScreenProps`
3. Call `const { hasAnyPermission } = useAdminPermissions();` inside the component
4. Inside the nav-buttons `<View>`, add **before** Sign Out:

```tsx
{
  hasAnyPermission ? (
    <Pressable
      onPress={onNavigateToAdmin}
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 8,
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: "600" }}>{t("account.admin", "Admin")}</Text>
    </Pressable>
  ) : null;
}
```

- [ ] **Step 3: Run the test to confirm it passes**

```bash
pnpm --filter native test account.screen
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/native/src/features/account/screens/account.screen.tsx \
        apps/native/src/features/account/screens/account.screen.spec.tsx
git commit -m "feat(native-admin): permission-gated Admin card in Account screen"
```

---

## Task 4: Admin Routing + Dashboard Screen

**Files:**

- Modify: `apps/native/src/app/(tabs)/account/_layout.tsx`
- Create: `apps/native/src/app/(tabs)/account/(admin)/_layout.tsx`
- Create: `apps/native/src/app/(tabs)/account/(admin)/index.tsx`
- Create: `apps/native/src/app/(tabs)/account/(admin)/lectures/index.tsx` (stub)
- Create: `apps/native/src/app/(tabs)/account/(admin)/live/index.tsx` (stub)
- Create: `apps/native/src/app/(tabs)/account/(admin)/scholars/index.tsx` (stub)
- Create: `apps/native/src/app/(tabs)/account/(admin)/scholars/[slug].tsx` (stub)
- Create: `apps/native/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.tsx`
- Create: `apps/native/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.spec.tsx`

- [ ] **Step 1: Write the failing test for the dashboard screen**

```typescript
// apps/native/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.spec.tsx
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AdminDashboardScreen } from './admin-dashboard.screen';
import { useAdminPermissions } from '@/features/admin/hooks/use-admin-permissions';

jest.mock('@/features/admin/hooks/use-admin-permissions', () => ({
  useAdminPermissions: jest.fn(),
}));
jest.mock('@/core/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (_k: string, fb: string) => fb }),
}));

const mocked = jest.mocked(useAdminPermissions);

describe('AdminDashboardScreen', () => {
  it('renders Lectures card when user has manage:content', () => {
    mocked.mockReturnValue({
      hasAnyPermission: true,
      hasPermission: (p: string) => p === 'manage:content',
      permissions: [],
      isLoading: false,
    });

    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <AdminDashboardScreen
          onNavigateToLectures={() => {}}
          onNavigateToLive={() => {}}
          onNavigateToScholars={() => {}}
          onNavigateToPermissions={() => {}}
        />
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Lectures');
  });

  it('hides Lectures card when user lacks manage:content', () => {
    mocked.mockReturnValue({
      hasAnyPermission: true,
      hasPermission: () => false,
      permissions: [],
      isLoading: false,
    });

    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <AdminDashboardScreen
          onNavigateToLectures={() => {}}
          onNavigateToLive={() => {}}
          onNavigateToScholars={() => {}}
          onNavigateToPermissions={() => {}}
        />
      );
    });
    expect(JSON.stringify(tree!.toJSON())).not.toContain('Lectures');
  });
});
```

Run: `pnpm --filter native test admin-dashboard.screen`
Expected: FAIL — module not found

- [ ] **Step 2: Create the dashboard screen**

```typescript
// apps/native/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.tsx
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAdminPermissions } from '@/features/admin/hooks/use-admin-permissions';

type AdminDashboardScreenProps = {
  onNavigateToLectures?: () => void;
  onNavigateToLive?: () => void;
  onNavigateToScholars?: () => void;
  onNavigateToPermissions?: () => void;
};

function AdminCard({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 12,
        backgroundColor: '#fff',
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{title}</Text>
      <Text style={{ fontSize: 13, color: '#666' }}>{description}</Text>
    </Pressable>
  );
}

export function AdminDashboardScreen({
  onNavigateToLectures,
  onNavigateToLive,
  onNavigateToScholars,
  onNavigateToPermissions,
}: AdminDashboardScreenProps) {
  const { hasPermission } = useAdminPermissions();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>Admin</Text>
      {hasPermission('manage:scholars') && (
        <AdminCard
          title="Scholars"
          description="Manage scholars, series, and collections"
          onPress={onNavigateToScholars}
        />
      )}
      {hasPermission('manage:content') && (
        <AdminCard
          title="Lectures"
          description="Upload audio, manage lectures and bulk actions"
          onPress={onNavigateToLectures}
        />
      )}
      {hasPermission('manage:livestreams') && (
        <AdminCard
          title="Live"
          description="Manage livestream channels and sessions"
          onPress={onNavigateToLive}
        />
      )}
      {hasPermission('manage:admin') && (
        <AdminCard
          title="Permissions"
          description="Manage admin user permissions"
          onPress={onNavigateToPermissions}
        />
      )}
    </ScrollView>
  );
}
```

- [ ] **Step 3: Run the test to confirm it passes**

```bash
pnpm --filter native test admin-dashboard.screen
```

Expected: PASS

- [ ] **Step 4: Create the routing layout and stub route files**

```typescript
// apps/native/src/app/(tabs)/account/(admin)/_layout.tsx
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="lectures/index" options={{ title: 'Lectures' }} />
      <Stack.Screen name="live/index" options={{ title: 'Live' }} />
      <Stack.Screen name="scholars/index" options={{ title: 'Scholars' }} />
      <Stack.Screen name="scholars/[slug]" options={{ title: 'Scholar' }} />
    </Stack>
  );
}
```

```typescript
// apps/native/src/app/(tabs)/account/(admin)/index.tsx
import { type Href, useRouter } from 'expo-router';
import { AdminDashboardScreen } from '@/features/admin/screens/admin-dashboard/admin-dashboard.screen';

export default function AdminIndexRoute() {
  const router = useRouter();
  return (
    <AdminDashboardScreen
      onNavigateToLectures={() => router.push('/(tabs)/account/(admin)/lectures' as Href)}
      onNavigateToLive={() => router.push('/(tabs)/account/(admin)/live' as Href)}
      onNavigateToScholars={() => router.push('/(tabs)/account/(admin)/scholars' as Href)}
      onNavigateToPermissions={() => {/* future permissions screen */}}
    />
  );
}
```

Create stub files for lectures, live, scholars, and `scholars/[slug]` — each renders
`<ScreenInProgress />` from `@/shared/components/ScreenInProgress/ScreenInProgress`. These get
replaced in Tasks 5–7.

```typescript
// apps/native/src/app/(tabs)/account/(admin)/lectures/index.tsx
import { ScreenInProgress } from '@/shared/components/ScreenInProgress/ScreenInProgress';
export default function AdminLecturesRoute() { return <ScreenInProgress />; }

// apps/native/src/app/(tabs)/account/(admin)/live/index.tsx
import { ScreenInProgress } from '@/shared/components/ScreenInProgress/ScreenInProgress';
export default function AdminLiveRoute() { return <ScreenInProgress />; }

// apps/native/src/app/(tabs)/account/(admin)/scholars/index.tsx
import { ScreenInProgress } from '@/shared/components/ScreenInProgress/ScreenInProgress';
export default function AdminScholarsRoute() { return <ScreenInProgress />; }

// apps/native/src/app/(tabs)/account/(admin)/scholars/[slug].tsx
import { ScreenInProgress } from '@/shared/components/ScreenInProgress/ScreenInProgress';
export default function AdminScholarDetailRoute() { return <ScreenInProgress />; }
```

- [ ] **Step 5: Wire the Admin card navigation in account/index.tsx**

Open `apps/native/src/app/(tabs)/account/index.tsx`. Add:

```typescript
onNavigateToAdmin={() => router.push('/(tabs)/account/(admin)' as Href)}
```

to the `<AccountScreen ... />` render call.

- [ ] **Step 6: Expose the (admin) group in the account layout**

In `apps/native/src/app/(tabs)/account/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add apps/native/src/features/admin/ \
        apps/native/src/app/(tabs)/account/
git commit -m "feat(native-admin): admin routing, dashboard screen, and account card wiring"
```

---

## Task 5: Admin Lectures Screen

**Files:**

- Create: `apps/native/src/features/admin-lectures/api/admin-lectures.api.ts`
- Create: `apps/native/src/features/admin-lectures/hooks/use-admin-lectures.ts`
- Create: `apps/native/src/features/admin-lectures/components/BulkActionBar/BulkActionBar.tsx`
- Create: `apps/native/src/features/admin-lectures/components/BulkActionBar/BulkActionBar.spec.tsx`
- Create: `apps/native/src/features/admin-lectures/components/AudioUploaderSheet/AudioUploaderSheet.tsx`
- Create: `apps/native/src/features/admin-lectures/components/AudioUploaderSheet/AudioUploaderSheet.spec.tsx`
- Create: `apps/native/src/features/admin-lectures/components/LectureEditSheet/LectureEditSheet.tsx`
- Create: `apps/native/src/features/admin-lectures/components/LectureEditSheet/LectureEditSheet.spec.tsx`
- Create: `apps/native/src/features/admin-lectures/screens/admin-lectures/admin-lectures.screen.tsx`
- Modify: `apps/native/src/app/(tabs)/account/(admin)/lectures/index.tsx`

- [ ] **Step 1: Create the API helper**

```typescript
// apps/native/src/features/admin-lectures/api/admin-lectures.api.ts
import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
  CreateLectureDto,
  AdminLectureListDto,
  AdminLectureDetailDto,
  AdminLectureUpdateDto,
  BulkActionDto,
  BulkActionResultDto,
} from "@sd/core-contracts";
import * as FileSystem from "expo-file-system";

export async function getPresignedUrl(
  data: PresignedUrlRequestDto,
): Promise<PresignedUrlResponseDto> {
  return httpClient<PresignedUrlResponseDto>({
    url: endpoints.admin.media.presignedUrl,
    method: "POST",
    body: data,
  });
}

export async function uploadToR2(
  uploadUrl: string,
  fileUri: string,
  contentType: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  const callback = onProgress
    ? ({ totalBytesSent, totalBytesExpectedToSend }: FileSystem.UploadProgressData) => {
        if (totalBytesExpectedToSend > 0) {
          onProgress(totalBytesSent / totalBytesExpectedToSend);
        }
      }
    : undefined;

  const uploadTask = FileSystem.createUploadTask(
    uploadUrl,
    fileUri,
    {
      httpMethod: "PUT",
      headers: { "Content-Type": contentType },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    },
    callback,
  );

  const result = await uploadTask.uploadAsync();
  if (!result || result.status >= 300) {
    throw new Error(`R2 upload failed: ${result?.status}`);
  }
}

export async function createLecture(data: CreateLectureDto): Promise<AdminLectureDetailDto> {
  return httpClient<AdminLectureDetailDto>({
    url: endpoints.admin.lectures.create,
    method: "POST",
    body: data,
  });
}

export async function fetchAdminLectures(params?: {
  scholarId?: string;
  status?: string;
  page?: number;
}): Promise<AdminLectureListDto> {
  return httpClient<AdminLectureListDto>({
    url: endpoints.admin.lectures.list,
    method: "GET",
    params: {
      scholarId: params?.scholarId,
      status: params?.status,
      page: params?.page,
    },
  });
}

export async function fetchAdminLectureDetail(id: string): Promise<AdminLectureDetailDto> {
  return httpClient<AdminLectureDetailDto>({
    url: endpoints.admin.lectures.detail(id),
    method: "GET",
  });
}

export async function updateLecture(
  id: string,
  data: Partial<AdminLectureUpdateDto>,
): Promise<AdminLectureDetailDto> {
  return httpClient<AdminLectureDetailDto>({
    url: endpoints.admin.lectures.update(id),
    method: "PUT",
    body: data,
  });
}

export async function bulkLectureAction(data: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient<BulkActionResultDto>({
    url: endpoints.admin.lectures.bulk,
    method: "POST",
    body: data,
  });
}
```

- [ ] **Step 2: Create the list hook**

```typescript
// apps/native/src/features/admin-lectures/hooks/use-admin-lectures.ts
import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { AdminLectureListDto } from "@sd/core-contracts";

export function useAdminLectures(params?: { scholarId?: string; status?: string; page?: number }) {
  return useApiQuery<AdminLectureListDto>(["admin", "lectures", params], () =>
    httpClient<AdminLectureListDto>({
      url: endpoints.admin.lectures.list,
      method: "GET",
      params: {
        scholarId: params?.scholarId,
        status: params?.status,
        page: params?.page,
      },
    }),
  );
}
```

- [ ] **Step 3: Write the failing test for BulkActionBar**

```typescript
// apps/native/src/features/admin-lectures/components/BulkActionBar/BulkActionBar.spec.tsx
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { BulkActionBar } from './BulkActionBar';

describe('BulkActionBar', () => {
  it('returns null when no items are selected', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <BulkActionBar selectedCount={0} onPublish={() => {}} onArchive={() => {}} />
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });

  it('shows count and action buttons when items are selected', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <BulkActionBar selectedCount={3} onPublish={() => {}} onArchive={() => {}} />
      );
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain('3 selected');
    expect(rendered).toContain('Publish');
    expect(rendered).toContain('Archive');
  });
});
```

Run: `pnpm --filter native test BulkActionBar`
Expected: FAIL

- [ ] **Step 4: Implement BulkActionBar**

```typescript
// apps/native/src/features/admin-lectures/components/BulkActionBar/BulkActionBar.tsx
import { Pressable, Text, View } from 'react-native';

type BulkActionBarProps = {
  selectedCount: number;
  onPublish: () => void;
  onArchive: () => void;
  isLoading?: boolean;
};

export function BulkActionBar({
  selectedCount,
  onPublish,
  onArchive,
  isLoading,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#1a1a1a',
        gap: 8,
      }}
    >
      <Text style={{ flex: 1, color: '#fff', fontSize: 13 }}>{selectedCount} selected</Text>
      <Pressable
        onPress={onPublish}
        disabled={isLoading}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: '#16a34a',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Publish</Text>
      </Pressable>
      <Pressable
        onPress={onArchive}
        disabled={isLoading}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: '#dc2626',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Archive</Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 5: Run BulkActionBar test to confirm pass**

```bash
pnpm --filter native test BulkActionBar
```

Expected: PASS

- [ ] **Step 6: Write failing test for AudioUploaderSheet**

```typescript
// apps/native/src/features/admin-lectures/components/AudioUploaderSheet/AudioUploaderSheet.spec.tsx
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AudioUploaderSheet } from './AudioUploaderSheet';

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({
  createUploadTask: jest.fn(),
  FileSystemUploadType: { BINARY_CONTENT: 'BINARY_CONTENT' },
}));
jest.mock('@/features/admin-lectures/api/admin-lectures.api', () => ({
  getPresignedUrl: jest.fn(),
  uploadToR2: jest.fn(),
  createLecture: jest.fn(),
}));

describe('AudioUploaderSheet', () => {
  it('renders Select Audio Files button when open', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <AudioUploaderSheet isOpen={true} onClose={() => {}} onUploadComplete={() => {}} />
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Select Audio Files');
  });

  it('renders nothing when closed', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <AudioUploaderSheet isOpen={false} onClose={() => {}} onUploadComplete={() => {}} />
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });
});
```

Run: `pnpm --filter native test AudioUploaderSheet`
Expected: FAIL

- [ ] **Step 7: Implement AudioUploaderSheet**

```typescript
// apps/native/src/features/admin-lectures/components/AudioUploaderSheet/AudioUploaderSheet.tsx
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getPresignedUrl, uploadToR2, createLecture } from '../../api/admin-lectures.api';

// Extract audio duration client-side using expo-audio (not expo-av, which is deprecated).
// createAudioPlayer reads only the container metadata — it does not decode PCM — so it is
// safe for large files (200MB+) without blowing up memory. Duration is reported in seconds.
async function getNativeAudioDuration(uri: string): Promise<number | undefined> {
  const { createAudioPlayer } = await import('expo-audio');
  return new Promise((resolve) => {
    const player = createAudioPlayer({ uri });
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) { resolved = true; player.remove(); resolve(undefined); }
    }, 5000);

    const sub = player.addListener('playbackStatusUpdate', (status) => {
      if (!resolved && status.duration > 0) {
        resolved = true;
        clearTimeout(timeout);
        sub.remove();
        player.remove();
        resolve(Math.round(status.duration));
      }
    });
  });
}

type UploadItem = {
  name: string;
  uri: string;
  mimeType: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
};

type AudioUploaderSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
};

export function AudioUploaderSheet({ isOpen, onClose, onUploadComplete }: AudioUploaderSheetProps) {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const setItemState = (
    index: number,
    update: Partial<UploadItem>,
  ) => {
    setQueue((prev) => prev.map((item, i) => (i === index ? { ...item, ...update } : item)));
  };

  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/mpeg', 'audio/mp4', 'audio/x-m4a'],
      multiple: true,
    });
    if (result.canceled) return;
    setQueue(
      result.assets.map((a) => ({
        name: a.name,
        uri: a.uri,
        mimeType: a.mimeType ?? 'audio/mpeg',
        progress: 0,
        status: 'pending' as const,
      })),
    );
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    let anySuccess = false;
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'done') continue;
      try {
        setItemState(i, { progress: 0, status: 'uploading' });
        const { uploadUrl, objectKey } = await getPresignedUrl({
          filename: item.name,
          contentType: item.mimeType,
          purpose: 'audio',
        });
        await uploadToR2(uploadUrl, item.uri, item.mimeType, (p) =>
          setItemState(i, { progress: p, status: 'uploading' }),
        );
        const durationSeconds = await getNativeAudioDuration(item.uri);
        await createLecture({
          title: item.name.replace(/\.[^.]+$/, ''),
          audioKey: objectKey,
          ...(durationSeconds != null ? { durationSeconds } : {}),
        });
        setItemState(i, { progress: 1, status: 'done' });
        anySuccess = true;
      } catch (err) {
        setItemState(i, { status: 'error', error: (err as Error).message });
      }
    }
    setIsUploading(false);
    if (anySuccess) onUploadComplete();
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: '80%',
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 12 }}>Upload Audio</Text>
      <Pressable
        onPress={handlePick}
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 15 }}>Select Audio Files</Text>
      </Pressable>
      <ScrollView style={{ maxHeight: 200 }}>
        {queue.map((item, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <Text numberOfLines={1} style={{ fontSize: 13 }}>
              {item.name}
            </Text>
            <View style={{ height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, marginTop: 4 }}>
              <View
                style={{
                  height: 4,
                  width: `${Math.round(item.progress * 100)}%`,
                  backgroundColor:
                    item.status === 'error'
                      ? '#dc2626'
                      : item.status === 'done'
                        ? '#16a34a'
                        : '#3b82f6',
                  borderRadius: 2,
                }}
              />
            </View>
            {item.status === 'error' && (
              <Text style={{ fontSize: 11, color: '#dc2626' }}>{item.error}</Text>
            )}
          </View>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={handleUploadAll}
          disabled={queue.length === 0 || isUploading}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: '#3b82f6',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600' }}>Upload All</Text>
          )}
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 8: Run AudioUploaderSheet test to confirm pass**

```bash
pnpm --filter native test AudioUploaderSheet
```

Expected: PASS

- [ ] **Step 9: Write failing test for LectureEditSheet**

```typescript
// apps/native/src/features/admin-lectures/components/LectureEditSheet/LectureEditSheet.spec.tsx
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { LectureEditSheet } from './LectureEditSheet';

jest.mock('@/features/admin-lectures/api/admin-lectures.api', () => ({
  fetchAdminLectureDetail: jest.fn().mockResolvedValue({
    id: 'lec-1',
    title: 'Test Lecture',
    status: 'draft',
    audioKey: 'audio/test.mp3',
  }),
  updateLecture: jest.fn(),
}));

describe('LectureEditSheet', () => {
  it('renders nothing when lectureId is null', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <LectureEditSheet lectureId={null} onClose={() => {}} onSaved={() => {}} />
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });

  it('renders edit form when lectureId is provided', async () => {
    let tree: ReturnType<typeof renderer.create>;
    await act(async () => {
      tree = renderer.create(
        <LectureEditSheet lectureId="lec-1" onClose={() => {}} onSaved={() => {}} />
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Edit Lecture');
    expect(JSON.stringify(tree!.toJSON())).toContain('Title');
  });
});
```

Run: `pnpm --filter native test LectureEditSheet`
Expected: FAIL

- [ ] **Step 10: Implement LectureEditSheet**

The sheet fetches the lecture detail when `lectureId` is non-null, then renders an edit form.
Fields: title, description, language, order index, publish / archive actions.

```typescript
// apps/native/src/features/admin-lectures/components/LectureEditSheet/LectureEditSheet.tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { AdminLectureDetailDto } from '@sd/core-contracts';
import { fetchAdminLectureDetail, updateLecture } from '../../api/admin-lectures.api';

type LectureEditSheetProps = {
  lectureId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export function LectureEditSheet({ lectureId, onClose, onSaved }: LectureEditSheetProps) {
  const [lecture, setLecture] = useState<AdminLectureDetailDto | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lectureId) { setLecture(null); return; }
    fetchAdminLectureDetail(lectureId).then((data) => {
      setLecture(data);
      setTitle(data.title ?? '');
      setDescription((data as any).description ?? '');
      setLanguage((data as any).language ?? '');
    });
  }, [lectureId]);

  if (!lectureId) return null;

  const handleSave = async () => {
    if (!lecture) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateLecture(lecture.id, {
        title,
        ...(description ? { description } : {}),
        ...(language ? { language } : {}),
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: '85%',
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 16 }}>Edit Lecture</Text>
      {!lecture ? (
        <ActivityIndicator style={{ marginVertical: 32 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
          />
          <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
          />
          <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Language</Text>
          <TextInput
            value={language}
            onChangeText={setLanguage}
            placeholder="e.g. ar, en"
            style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
          />
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
            Status: {lecture.status}
          </Text>
          {error && <Text style={{ color: '#dc2626', marginBottom: 8 }}>{error}</Text>}
        </ScrollView>
      )}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={handleSave}
          disabled={isSaving || !lecture}
          style={{ flex: 1, padding: 12, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center' }}
        >
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>}
        </Pressable>
        <Pressable onPress={onClose} style={{ padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center' }}>
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 11: Run LectureEditSheet test to confirm pass**

```bash
pnpm --filter native test LectureEditSheet
```

Expected: PASS

- [ ] **Step 12: Implement the lectures screen**

Lecture rows respond to short-press with the edit sheet (when nothing is selected) or selection
toggle (when at least one row is already selected). Long-press always toggles selection.

```typescript
// apps/native/src/features/admin-lectures/screens/admin-lectures/admin-lectures.screen.tsx
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { AdminLectureListItemDto } from '@sd/core-contracts';
import { useAdminLectures } from '../../hooks/use-admin-lectures';
import { bulkLectureAction } from '../../api/admin-lectures.api';
import { AudioUploaderSheet } from '../../components/AudioUploaderSheet/AudioUploaderSheet';
import { LectureEditSheet } from '../../components/LectureEditSheet/LectureEditSheet';
import { BulkActionBar } from '../../components/BulkActionBar/BulkActionBar';

export function AdminLecturesScreen() {
  const { data, isLoading, refetch } = useAdminLectures();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const lectures = data?.items ?? [];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRowPress = (id: string) => {
    if (selectedIds.size > 0) {
      toggleSelect(id);
    } else {
      setEditingLectureId(id);
    }
  };

  const handleBulkAction = async (action: 'publish' | 'archive') => {
    setIsBulkLoading(true);
    await bulkLectureAction({ action, ids: Array.from(selectedIds) });
    setSelectedIds(new Set());
    setIsBulkLoading(false);
    refetch();
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Lectures</Text>
        <Pressable
          onPress={() => setShowUploader(true)}
          style={{ padding: 10, backgroundColor: '#3b82f6', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>+ Upload</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Text style={{ textAlign: 'center', marginTop: 32 }}>Loading…</Text>
      ) : (
        <FlashList
          data={lectures}
          estimatedItemSize={72}
          keyExtractor={(item: AdminLectureListItemDto) => item.id}
          renderItem={({ item }: { item: AdminLectureListItemDto }) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <Pressable
                onPress={() => handleRowPress(item.id)}
                onLongPress={() => toggleSelect(item.id)}
                style={{
                  padding: 12,
                  marginHorizontal: 16,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: isSelected ? '#3b82f6' : '#e5e5e5',
                  borderRadius: 8,
                  backgroundColor: isSelected ? '#eff6ff' : '#fff',
                }}
              >
                <Text numberOfLines={1} style={{ fontWeight: '600' }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  {item.scholarName} · {item.status}
                </Text>
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <BulkActionBar
        selectedCount={selectedIds.size}
        onPublish={() => handleBulkAction('publish')}
        onArchive={() => handleBulkAction('archive')}
        isLoading={isBulkLoading}
      />

      <AudioUploaderSheet
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onUploadComplete={() => {
          setShowUploader(false);
          refetch();
        }}
      />

      <LectureEditSheet
        lectureId={editingLectureId}
        onClose={() => setEditingLectureId(null)}
        onSaved={() => {
          setEditingLectureId(null);
          refetch();
        }}
      />
    </View>
  );
}
```

- [ ] **Step 13: Replace stub route with the real screen**

```typescript
// apps/native/src/app/(tabs)/account/(admin)/lectures/index.tsx
import { AdminLecturesScreen } from '@/features/admin-lectures/screens/admin-lectures/admin-lectures.screen';
export default function AdminLecturesRoute() { return <AdminLecturesScreen />; }
```

- [ ] **Step 14: Commit**

```bash
git add apps/native/src/features/admin-lectures/ \
        apps/native/src/app/(tabs)/account/(admin)/lectures/
git commit -m "feat(native-admin): lectures screen with upload queue, edit sheet, and bulk actions"
```

---

## Task 6: Admin Live Screen

**Files:**

- Create: `apps/native/src/features/admin-live/api/admin-live.api.ts`
- Create: `apps/native/src/features/admin-live/hooks/use-admin-live.ts`
- Create: `apps/native/src/features/admin-live/components/ChannelSheet/ChannelSheet.tsx`
- Create: `apps/native/src/features/admin-live/components/ChannelSheet/ChannelSheet.spec.tsx`
- Create: `apps/native/src/features/admin-live/components/SessionSheet/SessionSheet.tsx`
- Create: `apps/native/src/features/admin-live/components/SessionSheet/SessionSheet.spec.tsx`
- Create: `apps/native/src/features/admin-live/screens/admin-live/admin-live.screen.tsx`
- Modify: `apps/native/src/app/(tabs)/account/(admin)/live/index.tsx`

- [ ] **Step 1: Create the API helper**

```typescript
// apps/native/src/features/admin-live/api/admin-live.api.ts
import { httpClient, endpoints } from "@sd/core-contracts";
import type {
  LivestreamChannelDto,
  CreateLivestreamChannelDto,
  UpdateLivestreamChannelDto,
  LiveSessionPublicDto,
  CreateLiveSessionDto,
  UpdateLiveSessionDto,
  LiveSessionStatus,
} from "@sd/core-contracts";

export async function fetchAdminChannels(): Promise<LivestreamChannelDto[]> {
  return httpClient<LivestreamChannelDto[]>({
    url: endpoints.admin.live.listChannels,
    method: "GET",
  });
}

export async function createChannel(
  data: CreateLivestreamChannelDto,
): Promise<LivestreamChannelDto> {
  return httpClient<LivestreamChannelDto>({
    url: endpoints.admin.live.createChannel,
    method: "POST",
    body: data,
  });
}

export async function updateChannel(
  id: string,
  data: Partial<UpdateLivestreamChannelDto>,
): Promise<LivestreamChannelDto> {
  return httpClient<LivestreamChannelDto>({
    url: endpoints.admin.live.updateChannel(id),
    method: "PUT",
    body: data,
  });
}

export async function createSession(data: CreateLiveSessionDto): Promise<LiveSessionPublicDto> {
  return httpClient<LiveSessionPublicDto>({
    url: endpoints.admin.live.createSession,
    method: "POST",
    body: data,
  });
}

export async function updateSession(
  id: string,
  data: Partial<UpdateLiveSessionDto>,
): Promise<LiveSessionPublicDto> {
  return httpClient<LiveSessionPublicDto>({
    url: endpoints.admin.live.updateSession(id),
    method: "PUT",
    body: data,
  });
}

export async function updateSessionStatus(
  id: string,
  status: LiveSessionStatus,
): Promise<LiveSessionPublicDto> {
  return httpClient<LiveSessionPublicDto>({
    url: endpoints.admin.live.updateStatus(id),
    method: "PATCH",
    body: { status },
  });
}
```

- [ ] **Step 2: Create the data hooks**

```typescript
// apps/native/src/features/admin-live/hooks/use-admin-live.ts
import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { LivestreamChannelDto, LiveSessionDeltaDto } from "@sd/core-contracts";

export function useAdminChannels() {
  return useApiQuery<LivestreamChannelDto[]>(["admin", "live", "channels"], () =>
    httpClient<LivestreamChannelDto[]>({ url: endpoints.admin.live.listChannels, method: "GET" }),
  );
}

export function useAdminSessions() {
  return useApiQuery<LiveSessionDeltaDto>(["admin", "live", "sessions"], () =>
    httpClient<LiveSessionDeltaDto>({ url: endpoints.admin.live.listSessions, method: "GET" }),
  );
}
```

- [ ] **Step 3: Write failing test for ChannelSheet**

```typescript
// apps/native/src/features/admin-live/components/ChannelSheet/ChannelSheet.spec.tsx
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ChannelSheet } from './ChannelSheet';

jest.mock('@/features/admin-live/api/admin-live.api', () => ({
  createChannel: jest.fn(),
  updateChannel: jest.fn(),
}));

describe('ChannelSheet', () => {
  it('renders channel form with all helper texts when open', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <ChannelSheet isOpen={true} onClose={() => {}} onSaved={() => {}} />
      );
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain('Telegram ID');
    expect(rendered).toContain('@userinfobot');
    expect(rendered).toContain('Display Name');
    expect(rendered).toContain('Telegram Slug');
  });

  it('renders nothing when closed', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <ChannelSheet isOpen={false} onClose={() => {}} onSaved={() => {}} />
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });
});
```

Run: `pnpm --filter native test ChannelSheet`
Expected: FAIL

- [ ] **Step 4: Implement ChannelSheet**

`telegramId` is write-only — the API never returns it in `LivestreamChannelDto`. Initialise it
to empty string in both create and edit modes.

```typescript
// apps/native/src/features/admin-live/components/ChannelSheet/ChannelSheet.tsx
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { LivestreamChannelDto } from '@sd/core-contracts';
import { createChannel, updateChannel } from '../../api/admin-live.api';

const HELPER_TEXT = {
  telegramId:
    "The numeric channel ID from Telegram (e.g. -1001234567890). Find it by forwarding a message from the channel to @userinfobot.",
  displayName:
    "The name shown to users in the app. Can differ from the Telegram channel name.",
  telegramSlug:
    "The channel's public username without the @ (e.g. duruschannel). Leave blank if the channel is private.",
  language: "Locale code for this channel's primary language (e.g. ar, en).",
} as const;

type ChannelSheetProps = {
  isOpen: boolean;
  channel?: LivestreamChannelDto;
  onClose: () => void;
  onSaved: () => void;
};

export function ChannelSheet({ isOpen, channel, onClose, onSaved }: ChannelSheetProps) {
  // telegramId is write-only — not returned by the API; always starts empty
  const [telegramId, setTelegramId] = useState('');
  const [displayName, setDisplayName] = useState(channel?.displayName ?? '');
  const [telegramSlug, setTelegramSlug] = useState(channel?.telegramSlug ?? '');
  const [language, setLanguage] = useState(channel?.language ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!displayName) { setError('Display Name is required'); return; }
    if (!channel && !telegramId) { setError('Telegram ID is required for new channels'); return; }
    setIsSaving(true);
    setError(null);
    try {
      if (channel) {
        await updateChannel(channel.id, {
          displayName,
          telegramSlug: telegramSlug || undefined,
          language: language || undefined,
        });
      } else {
        await createChannel({
          telegramId,
          displayName,
          telegramSlug: telegramSlug || undefined,
          language: language || undefined,
        });
      }
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const fields: Array<{
    key: keyof typeof HELPER_TEXT;
    label: string;
    value: string;
    set: (v: string) => void;
    keyboardType?: 'default' | 'numeric';
    showInEditMode?: boolean;
  }> = [
    { key: 'telegramId', label: 'Telegram ID *', value: telegramId, set: setTelegramId, keyboardType: 'numeric', showInEditMode: false },
    { key: 'displayName', label: 'Display Name *', value: displayName, set: setDisplayName },
    { key: 'telegramSlug', label: 'Telegram Slug', value: telegramSlug, set: setTelegramSlug },
    { key: 'language', label: 'Language', value: language, set: setLanguage },
  ];

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: '90%',
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 16 }}>
        {channel ? 'Edit Channel' : 'New Channel'}
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {fields
          .filter((f) => f.showInEditMode !== false || !channel)
          .map(({ key, label, value, set, keyboardType }) => (
            <View key={key} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>{label}</Text>
              <TextInput
                value={value}
                onChangeText={set}
                keyboardType={keyboardType ?? 'default'}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 14,
                }}
              />
              <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                {HELPER_TEXT[key]}
              </Text>
            </View>
          ))}
        {error && <Text style={{ color: '#dc2626', marginBottom: 8 }}>{error}</Text>}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={{ flex: 1, padding: 12, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center' }}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
          )}
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{ padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center' }}
        >
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 5: Run ChannelSheet test to confirm pass**

```bash
pnpm --filter native test ChannelSheet
```

Expected: PASS

- [ ] **Step 6: Write failing test for SessionSheet**

```typescript
// apps/native/src/features/admin-live/components/SessionSheet/SessionSheet.spec.tsx
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SessionSheet } from './SessionSheet';

jest.mock('@/features/admin-live/api/admin-live.api', () => ({
  createSession: jest.fn(),
}));

describe('SessionSheet', () => {
  it('renders session form with channel list when open', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <SessionSheet
          isOpen={true}
          channels={[
            { id: 'ch1', displayName: 'Channel One', isActive: true, createdAt: '', updatedAt: '' },
          ]}
          onClose={() => {}}
          onSaved={() => {}}
        />
      );
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain('New Session');
    expect(rendered).toContain('Channel One');
  });

  it('renders nothing when closed', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <SessionSheet isOpen={false} channels={[]} onClose={() => {}} onSaved={() => {}} />
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });
});
```

Run: `pnpm --filter native test SessionSheet`
Expected: FAIL

- [ ] **Step 7: Implement SessionSheet**

```typescript
// apps/native/src/features/admin-live/components/SessionSheet/SessionSheet.tsx
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { LivestreamChannelDto } from '@sd/core-contracts';
import { createSession } from '../../api/admin-live.api';

type SessionSheetProps = {
  isOpen: boolean;
  channels: LivestreamChannelDto[];
  onClose: () => void;
  onSaved: () => void;
};

export function SessionSheet({ isOpen, channels, onClose, onSaved }: SessionSheetProps) {
  const [channelId, setChannelId] = useState(channels[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!channelId) { setError('Channel is required'); return; }
    setIsSaving(true);
    setError(null);
    try {
      await createSession({
        channelId,
        title: title || undefined,
        scheduledAt: scheduledAt || undefined,
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: '80%',
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 16 }}>New Session</Text>
      <ScrollView>
        <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Channel *</Text>
        {channels.map((ch) => (
          <Pressable
            key={ch.id}
            onPress={() => setChannelId(ch.id)}
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: channelId === ch.id ? '#3b82f6' : '#d1d5db',
              borderRadius: 8,
              marginBottom: 4,
              backgroundColor: channelId === ch.id ? '#eff6ff' : '#fff',
            }}
          >
            <Text>{ch.displayName}</Text>
          </Pressable>
        ))}
        <Text style={{ fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 4 }}>
          Title (optional)
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
          Scheduled At (ISO, optional)
        </Text>
        <TextInput
          value={scheduledAt}
          onChangeText={setScheduledAt}
          placeholder="e.g. 2026-07-01T18:00:00Z"
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
        />
        {error && <Text style={{ color: '#dc2626', marginBottom: 8 }}>{error}</Text>}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={{ flex: 1, padding: 12, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center' }}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
          )}
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{ padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center' }}
        >
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 8: Run SessionSheet test to confirm pass**

```bash
pnpm --filter native test SessionSheet
```

Expected: PASS

- [ ] **Step 9: Implement the live screen**

Sessions and Channels displayed as two sections in a single scroll. Status change buttons call
`updateSessionStatus` and then refetch.

```typescript
// apps/native/src/features/admin-live/screens/admin-live/admin-live.screen.tsx
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { LivestreamChannelDto, LiveSessionPublicDto } from '@sd/core-contracts';
import { useAdminChannels, useAdminSessions } from '../../hooks/use-admin-live';
import { updateSessionStatus } from '../../api/admin-live.api';
import { ChannelSheet } from '../../components/ChannelSheet/ChannelSheet';
import { SessionSheet } from '../../components/SessionSheet/SessionSheet';

function SessionRow({
  session,
  onStatusChange,
}: {
  session: LiveSessionPublicDto;
  onStatusChange: (id: string, status: 'live' | 'ended') => void;
}) {
  const statusColor = session.status === 'live' ? '#dc2626' : session.status === 'scheduled' ? '#d97706' : '#6b7280';
  return (
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ flex: 1, fontWeight: '600' }} numberOfLines={1}>
          {session.title ?? session.channelDisplayName}
        </Text>
        <View
          style={{
            backgroundColor: statusColor + '22',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 11, color: statusColor, fontWeight: '600', textTransform: 'capitalize' }}>
            {session.status}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
        {session.status === 'scheduled' && (
          <Pressable
            onPress={() => onStatusChange(session.id, 'live')}
            style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#dc2626', borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Go Live</Text>
          </Pressable>
        )}
        {session.status === 'live' && (
          <Pressable
            onPress={() => onStatusChange(session.id, 'ended')}
            style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#374151', borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>End</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function AdminLiveScreen() {
  const { data: sessionsData, refetch: refetchSessions } = useAdminSessions();
  const { data: channels, refetch: refetchChannels } = useAdminChannels();
  const [showChannelSheet, setShowChannelSheet] = useState(false);
  const [editingChannel, setEditingChannel] = useState<LivestreamChannelDto | undefined>();
  const [showSessionSheet, setShowSessionSheet] = useState(false);
  const sessions = sessionsData?.sessions ?? [];

  const handleStatusChange = async (id: string, status: 'live' | 'ended') => {
    await updateSessionStatus(id, status);
    refetchSessions();
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Sessions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700' }}>Sessions</Text>
        <Pressable
          onPress={() => setShowSessionSheet(true)}
          style={{ padding: 8, backgroundColor: '#3b82f6', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>+ New</Text>
        </Pressable>
      </View>
      {sessions.length === 0 && (
        <Text style={{ color: '#6b7280', marginBottom: 16 }}>No sessions found.</Text>
      )}
      {sessions.map((s) => (
        <SessionRow key={s.id} session={s} onStatusChange={handleStatusChange} />
      ))}

      {/* Channels */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700' }}>Channels</Text>
        <Pressable
          onPress={() => { setEditingChannel(undefined); setShowChannelSheet(true); }}
          style={{ padding: 8, backgroundColor: '#3b82f6', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>+ New</Text>
        </Pressable>
      </View>
      {(channels ?? []).map((ch: LivestreamChannelDto) => (
        <Pressable
          key={ch.id}
          onPress={() => { setEditingChannel(ch); setShowChannelSheet(true); }}
          style={{ padding: 12, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, marginBottom: 8 }}
        >
          <Text style={{ fontWeight: '600' }}>{ch.displayName}</Text>
          <Text style={{ fontSize: 12, color: '#6b7280' }}>
            {ch.telegramSlug ? `@${ch.telegramSlug}` : 'Private'} · {ch.language ?? '—'} ·{' '}
            {ch.isActive ? 'Active' : 'Inactive'}
          </Text>
        </Pressable>
      ))}

      <ChannelSheet
        isOpen={showChannelSheet}
        channel={editingChannel}
        onClose={() => setShowChannelSheet(false)}
        onSaved={() => { setShowChannelSheet(false); refetchChannels(); }}
      />
      <SessionSheet
        isOpen={showSessionSheet}
        channels={channels ?? []}
        onClose={() => setShowSessionSheet(false)}
        onSaved={() => { setShowSessionSheet(false); refetchSessions(); }}
      />
    </ScrollView>
  );
}
```

- [ ] **Step 10: Replace stub route**

```typescript
// apps/native/src/app/(tabs)/account/(admin)/live/index.tsx
import { AdminLiveScreen } from '@/features/admin-live/screens/admin-live/admin-live.screen';
export default function AdminLiveRoute() { return <AdminLiveScreen />; }
```

- [ ] **Step 11: Commit**

```bash
git add apps/native/src/features/admin-live/ \
        apps/native/src/app/(tabs)/account/(admin)/live/
git commit -m "feat(native-admin): live screen with channels and sessions management"
```

---

## Task 7: Admin Scholars Screen with Series & Collections

**Files:**

- Create: `apps/native/src/features/admin-scholars/api/admin-scholars.api.ts`
- Create: `apps/native/src/features/admin-scholars/hooks/use-admin-scholars.ts`
- Create: `apps/native/src/features/admin-scholars/components/SeriesSheet/SeriesSheet.tsx`
- Create: `apps/native/src/features/admin-scholars/components/SeriesSheet/SeriesSheet.spec.tsx`
- Create: `apps/native/src/features/admin-scholars/components/CollectionSheet/CollectionSheet.tsx`
- Create: `apps/native/src/features/admin-scholars/components/CollectionSheet/CollectionSheet.spec.tsx`
- Create: `apps/native/src/features/admin-scholars/screens/admin-scholars/admin-scholars.screen.tsx`
- Create: `apps/native/src/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen.tsx`
- Modify: `apps/native/src/app/(tabs)/account/(admin)/scholars/index.tsx`
- Modify: `apps/native/src/app/(tabs)/account/(admin)/scholars/[slug].tsx`

Note: the scholar detail route uses the scholar's `slug` (not `id`) as the path parameter.
The public `GET /scholars/:slug` endpoint (which requires a slug) is used to fetch the scholar
data, and `scholar.id` is then passed to the admin series/collections queries.

- [ ] **Step 1: Create the API helper**

```typescript
// apps/native/src/features/admin-scholars/api/admin-scholars.api.ts
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

// Series
export async function fetchAdminSeries(scholarId: string): Promise<AdminSeriesListItemDto[]> {
  return httpClient<AdminSeriesListItemDto[]>({
    url: endpoints.admin.series.list,
    method: "GET",
    params: { scholarId },
  });
}

export async function createSeries(data: CreateSeriesDto): Promise<AdminSeriesDetailDto> {
  return httpClient<AdminSeriesDetailDto>({
    url: endpoints.admin.series.create,
    method: "POST",
    body: data,
  });
}

export async function updateSeries(
  id: string,
  data: Partial<UpdateSeriesDto>,
): Promise<AdminSeriesDetailDto> {
  return httpClient<AdminSeriesDetailDto>({
    url: endpoints.admin.series.update(id),
    method: "PATCH",
    body: data,
  });
}

export async function bulkSeriesAction(data: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient<BulkActionResultDto>({
    url: endpoints.admin.series.bulk,
    method: "POST",
    body: data,
  });
}

// Collections
export async function fetchAdminCollections(
  scholarId: string,
): Promise<AdminCollectionListItemDto[]> {
  return httpClient<AdminCollectionListItemDto[]>({
    url: endpoints.admin.collections.list,
    method: "GET",
    params: { scholarId },
  });
}

export async function createCollection(
  data: CreateCollectionDto,
): Promise<AdminCollectionDetailDto> {
  return httpClient<AdminCollectionDetailDto>({
    url: endpoints.admin.collections.create,
    method: "POST",
    body: data,
  });
}

export async function updateCollection(
  id: string,
  data: Partial<UpdateCollectionDto>,
): Promise<AdminCollectionDetailDto> {
  return httpClient<AdminCollectionDetailDto>({
    url: endpoints.admin.collections.update(id),
    method: "PATCH",
    body: data,
  });
}

export async function bulkCollectionAction(data: BulkActionDto): Promise<BulkActionResultDto> {
  return httpClient<BulkActionResultDto>({
    url: endpoints.admin.collections.bulk,
    method: "POST",
    body: data,
  });
}
```

- [ ] **Step 2: Create the hooks**

```typescript
// apps/native/src/features/admin-scholars/hooks/use-admin-scholars.ts
import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { AdminSeriesListItemDto, AdminCollectionListItemDto } from "@sd/core-contracts";

export function useAdminSeries(scholarId: string) {
  return useApiQuery<AdminSeriesListItemDto[]>(["admin", "series", scholarId], () =>
    httpClient<AdminSeriesListItemDto[]>({
      url: endpoints.admin.series.list,
      method: "GET",
      params: { scholarId },
    }),
  );
}

export function useAdminCollections(scholarId: string) {
  return useApiQuery<AdminCollectionListItemDto[]>(["admin", "collections", scholarId], () =>
    httpClient<AdminCollectionListItemDto[]>({
      url: endpoints.admin.collections.list,
      method: "GET",
      params: { scholarId },
    }),
  );
}
```

- [ ] **Step 3: Write failing test for SeriesSheet**

```typescript
// apps/native/src/features/admin-scholars/components/SeriesSheet/SeriesSheet.spec.tsx
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SeriesSheet } from './SeriesSheet';

jest.mock('@/features/admin-scholars/api/admin-scholars.api', () => ({
  createSeries: jest.fn(),
  updateSeries: jest.fn(),
}));

describe('SeriesSheet', () => {
  it('renders create form when no series is provided', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <SeriesSheet isOpen={true} scholarId="s1" onClose={() => {}} onSaved={() => {}} />
      );
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain('New Series');
    expect(rendered).toContain('Title');
  });

  it('renders nothing when closed', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <SeriesSheet isOpen={false} scholarId="s1" onClose={() => {}} onSaved={() => {}} />
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });
});
```

Run: `pnpm --filter native test SeriesSheet`
Expected: FAIL

- [ ] **Step 4: Implement SeriesSheet**

```typescript
// apps/native/src/features/admin-scholars/components/SeriesSheet/SeriesSheet.tsx
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { AdminSeriesDetailDto } from '@sd/core-contracts';
import { createSeries, updateSeries } from '../../api/admin-scholars.api';

type SeriesSheetProps = {
  isOpen: boolean;
  scholarId: string;
  series?: AdminSeriesDetailDto;
  onClose: () => void;
  onSaved: () => void;
};

export function SeriesSheet({ isOpen, scholarId, series, onClose, onSaved }: SeriesSheetProps) {
  const [title, setTitle] = useState(series?.title ?? '');
  const [description, setDescription] = useState(series?.description ?? '');
  const [language, setLanguage] = useState(series?.language ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setIsSaving(true);
    setError(null);
    try {
      if (series) {
        await updateSeries(series.id, {
          title,
          description: description || undefined,
          language: language || undefined,
        });
      } else {
        await createSeries({
          scholarId,
          title,
          description: description || undefined,
          language: language || undefined,
        });
      }
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: '80%',
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 16 }}>
        {series ? 'Edit Series' : 'New Series'}
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Language</Text>
        <TextInput
          value={language}
          onChangeText={setLanguage}
          placeholder="e.g. ar, en"
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
        />
        {error && <Text style={{ color: '#dc2626', marginBottom: 8 }}>{error}</Text>}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={{ flex: 1, padding: 12, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center' }}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
          )}
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{ padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center' }}
        >
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 5: Run SeriesSheet test to confirm pass**

```bash
pnpm --filter native test SeriesSheet
```

Expected: PASS

- [ ] **Step 6: Write failing test for CollectionSheet**

```typescript
// apps/native/src/features/admin-scholars/components/CollectionSheet/CollectionSheet.spec.tsx
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CollectionSheet } from './CollectionSheet';

jest.mock('@/features/admin-scholars/api/admin-scholars.api', () => ({
  createCollection: jest.fn(),
  updateCollection: jest.fn(),
}));

describe('CollectionSheet', () => {
  it('renders create form when no collection is provided', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <CollectionSheet isOpen={true} scholarId="s1" onClose={() => {}} onSaved={() => {}} />
      );
    });
    const rendered = JSON.stringify(tree!.toJSON());
    expect(rendered).toContain('New Collection');
    expect(rendered).toContain('Title');
  });

  it('renders Edit Collection title when collection is provided', () => {
    const collection = {
      id: 'col-1',
      scholarId: 's1',
      title: 'My Collection',
      status: 'draft',
    };
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <CollectionSheet
          isOpen={true}
          scholarId="s1"
          collection={collection as any}
          onClose={() => {}}
          onSaved={() => {}}
        />
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('Edit Collection');
  });

  it('renders nothing when closed', () => {
    let tree: ReturnType<typeof renderer.create>;
    act(() => {
      tree = renderer.create(
        <CollectionSheet isOpen={false} scholarId="s1" onClose={() => {}} onSaved={() => {}} />
      );
    });
    expect(tree!.toJSON()).toBeNull();
  });
});
```

Run: `pnpm --filter native test CollectionSheet`
Expected: FAIL

- [ ] **Step 7: Implement CollectionSheet**

```typescript
// apps/native/src/features/admin-scholars/components/CollectionSheet/CollectionSheet.tsx
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { AdminCollectionDetailDto } from '@sd/core-contracts';
import { createCollection, updateCollection } from '../../api/admin-scholars.api';

type CollectionSheetProps = {
  isOpen: boolean;
  scholarId: string;
  collection?: AdminCollectionDetailDto;
  onClose: () => void;
  onSaved: () => void;
};

export function CollectionSheet({
  isOpen,
  scholarId,
  collection,
  onClose,
  onSaved,
}: CollectionSheetProps) {
  const [title, setTitle] = useState(collection?.title ?? '');
  const [description, setDescription] = useState(collection?.description ?? '');
  const [language, setLanguage] = useState(collection?.language ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setIsSaving(true);
    setError(null);
    try {
      if (collection) {
        await updateCollection(collection.id, {
          title,
          description: description || undefined,
          language: language || undefined,
        });
      } else {
        await createCollection({
          scholarId,
          title,
          description: description || undefined,
          language: language || undefined,
        });
      }
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: '80%',
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 16 }}>
        {collection ? 'Edit Collection' : 'New Collection'}
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Language</Text>
        <TextInput
          value={language}
          onChangeText={setLanguage}
          placeholder="e.g. ar, en"
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 12 }}
        />
        {error && <Text style={{ color: '#dc2626', marginBottom: 8 }}>{error}</Text>}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={{ flex: 1, padding: 12, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center' }}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
          )}
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{ padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center' }}
        >
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 8: Run CollectionSheet test to confirm pass**

```bash
pnpm --filter native test CollectionSheet
```

Expected: PASS

- [ ] **Step 9: Implement the scholars list screen**

```typescript
// apps/native/src/features/admin-scholars/screens/admin-scholars/admin-scholars.screen.tsx
import { Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useApiQuery, httpClient, endpoints } from '@sd/core-contracts';
import type { ScholarListItemDto } from '@sd/core-contracts';

type AdminScholarsScreenProps = {
  onNavigateToScholar: (slug: string) => void;
};

export function AdminScholarsScreen({ onNavigateToScholar }: AdminScholarsScreenProps) {
  const { data, isLoading } = useApiQuery<ScholarListItemDto[]>(
    ['scholars', 'list'],
    () => httpClient<ScholarListItemDto[]>({ url: endpoints.scholars.list, method: 'GET' }),
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Scholars</Text>
      </View>
      {isLoading ? (
        <Text style={{ textAlign: 'center', marginTop: 32 }}>Loading…</Text>
      ) : (
        <FlashList
          data={data ?? []}
          estimatedItemSize={64}
          keyExtractor={(item: ScholarListItemDto) => item.id}
          renderItem={({ item }: { item: ScholarListItemDto }) => (
            <Pressable
              onPress={() => onNavigateToScholar(item.slug)}
              style={{
                padding: 14,
                marginHorizontal: 16,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: '#e5e5e5',
                borderRadius: 8,
                backgroundColor: '#fff',
              }}
            >
              <Text style={{ fontWeight: '600' }}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>@{item.slug}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
```

- [ ] **Step 10: Implement the scholar detail screen with drag-and-drop**

The route receives a `slug`. The screen first fetches `GET /scholars/:slug` to get the
`ScholarDetailDto` (which includes `id`). The `id` is then used for admin series/collections
queries. Sections are collapsible. Long-press a row to initiate drag.

```typescript
// apps/native/src/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen.tsx
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';
import { ScrollView } from 'react-native';
import { useApiQuery, httpClient, endpoints } from '@sd/core-contracts';
import type {
  ScholarDetailDto,
  AdminSeriesListItemDto,
  AdminCollectionListItemDto,
} from '@sd/core-contracts';
import { useAdminSeries, useAdminCollections } from '../../hooks/use-admin-scholars';
import { updateSeries, updateCollection } from '../../api/admin-scholars.api';
import { SeriesSheet } from '../../components/SeriesSheet/SeriesSheet';
import { CollectionSheet } from '../../components/CollectionSheet/CollectionSheet';

type AdminScholarDetailScreenProps = {
  scholarSlug: string;
};

function SectionHeader({
  title,
  isExpanded,
  onToggle,
  onAdd,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 8,
      }}
    >
      <Text style={{ flex: 1, fontSize: 16, fontWeight: '700' }}>{title}</Text>
      <Pressable
        onPress={(e) => { e.stopPropagation(); onAdd(); }}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: '#3b82f6',
          borderRadius: 6,
          marginRight: 8,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>+ Add</Text>
      </Pressable>
      <Text style={{ color: '#6b7280' }}>{isExpanded ? '▲' : '▼'}</Text>
    </Pressable>
  );
}

export function AdminScholarDetailScreen({ scholarSlug }: AdminScholarDetailScreenProps) {
  const { data: scholar } = useApiQuery<ScholarDetailDto>(
    ['scholars', scholarSlug],
    () =>
      httpClient<ScholarDetailDto>({ url: endpoints.scholars.detail(scholarSlug), method: 'GET' }),
  );

  const scholarId = scholar?.id ?? '';

  const { data: seriesList, refetch: refetchSeries } = useAdminSeries(scholarId);
  const { data: collectionList, refetch: refetchCollections } = useAdminCollections(scholarId);

  const [seriesExpanded, setSeriesExpanded] = useState(true);
  const [collectionsExpanded, setCollectionsExpanded] = useState(true);
  const [showSeriesSheet, setShowSeriesSheet] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);

  // Optimistic order state for drag-and-drop
  const [seriesOrder, setSeriesOrder] = useState<AdminSeriesListItemDto[] | null>(null);
  const [collectionOrder, setCollectionOrder] = useState<AdminCollectionListItemDto[] | null>(null);

  const displaySeries = seriesOrder ?? seriesList ?? [];
  const displayCollections = collectionOrder ?? collectionList ?? [];

  const handleSeriesDragEnd = async ({
    data,
    to,
  }: {
    data: AdminSeriesListItemDto[];
    from: number;
    to: number;
  }) => {
    const prevOrder = seriesOrder ?? seriesList ?? [];
    setSeriesOrder(data);
    try {
      await updateSeries(data[to].id, { orderIndex: to });
    } catch {
      setSeriesOrder(prevOrder);
    }
  };

  const handleCollectionDragEnd = async ({
    data,
    to,
  }: {
    data: AdminCollectionListItemDto[];
    from: number;
    to: number;
  }) => {
    const prevOrder = collectionOrder ?? collectionList ?? [];
    setCollectionOrder(data);
    try {
      await updateCollection(data[to].id, { orderIndex: to });
    } catch {
      setCollectionOrder(prevOrder);
    }
  };

  if (!scholar) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 4 }}>{scholar.name}</Text>
        <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>@{scholar.slug}</Text>

        {/* Series section */}
        <SectionHeader
          title="Series"
          isExpanded={seriesExpanded}
          onToggle={() => setSeriesExpanded((v) => !v)}
          onAdd={() => setShowSeriesSheet(true)}
        />
        {seriesExpanded && (
          <DraggableFlatList
            data={displaySeries}
            keyExtractor={(item) => item.id}
            onDragEnd={handleSeriesDragEnd}
            scrollEnabled={false}
            renderItem={({
              item,
              drag,
              isActive,
            }: RenderItemParams<AdminSeriesListItemDto>) => (
              <Pressable
                onLongPress={drag}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: isActive ? '#3b82f6' : '#e5e5e5',
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: isActive ? '#eff6ff' : '#fff',
                  opacity: isActive ? 0.9 : 1,
                }}
              >
                <Text style={{ fontWeight: '600' }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {item.publishedLectureCount ?? 0} lectures · {item.status}
                </Text>
              </Pressable>
            )}
          />
        )}

        {/* Collections section */}
        <SectionHeader
          title="Collections"
          isExpanded={collectionsExpanded}
          onToggle={() => setCollectionsExpanded((v) => !v)}
          onAdd={() => setShowCollectionSheet(true)}
        />
        {collectionsExpanded && (
          <DraggableFlatList
            data={displayCollections}
            keyExtractor={(item) => item.id}
            onDragEnd={handleCollectionDragEnd}
            scrollEnabled={false}
            renderItem={({
              item,
              drag,
              isActive,
            }: RenderItemParams<AdminCollectionListItemDto>) => (
              <Pressable
                onLongPress={drag}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: isActive ? '#3b82f6' : '#e5e5e5',
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: isActive ? '#eff6ff' : '#fff',
                  opacity: isActive ? 0.9 : 1,
                }}
              >
                <Text style={{ fontWeight: '600' }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>{item.status}</Text>
              </Pressable>
            )}
          />
        )}

        <SeriesSheet
          isOpen={showSeriesSheet}
          scholarId={scholarId}
          onClose={() => setShowSeriesSheet(false)}
          onSaved={() => { setShowSeriesSheet(false); setSeriesOrder(null); refetchSeries(); }}
        />
        <CollectionSheet
          isOpen={showCollectionSheet}
          scholarId={scholarId}
          onClose={() => setShowCollectionSheet(false)}
          onSaved={() => { setShowCollectionSheet(false); setCollectionOrder(null); refetchCollections(); }}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 11: Replace stub route files with real screens**

```typescript
// apps/native/src/app/(tabs)/account/(admin)/scholars/index.tsx
import { type Href, useRouter } from 'expo-router';
import { AdminScholarsScreen } from '@/features/admin-scholars/screens/admin-scholars/admin-scholars.screen';

export default function AdminScholarsRoute() {
  const router = useRouter();
  return (
    <AdminScholarsScreen
      onNavigateToScholar={(slug) =>
        router.push(`/(tabs)/account/(admin)/scholars/${slug}` as Href)
      }
    />
  );
}
```

```typescript
// apps/native/src/app/(tabs)/account/(admin)/scholars/[slug].tsx
import { useLocalSearchParams } from 'expo-router';
import { AdminScholarDetailScreen } from '@/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen';

export default function AdminScholarDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <AdminScholarDetailScreen scholarSlug={slug} />;
}
```

- [ ] **Step 12: Commit**

```bash
git add apps/native/src/features/admin-scholars/ \
        apps/native/src/app/(tabs)/account/(admin)/scholars/
git commit -m "feat(native-admin): scholars screen with series/collections drag-and-drop"
```

---

## Task 8: Run All Tests and Type-Check

- [ ] **Step 1: Run all native tests**

```bash
pnpm --filter native test --passWithNoTests
```

Expected: all tests PASS

- [ ] **Step 2: Type-check the native app**

```bash
pnpm --filter native typecheck
```

Expected: no errors

- [ ] **Step 3: Fix any type errors, commit**

If TypeScript reports errors (most likely in drag-and-drop types or optional fields), fix them.

```bash
git add -p
git commit -m "fix(native-admin): resolve type errors from admin screens"
```

---

> **After completing all tasks:** verify the app runs on the iOS simulator or Android emulator.
> Navigate to Account → Admin. Confirm the Admin card appears (for users with permissions), the
> dashboard shows the correct permission-gated cards, and each admin screen loads without a crash.
