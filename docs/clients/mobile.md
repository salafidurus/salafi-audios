# Mobile Application

## 1. Role of the Mobile App

The mobile app (`apps/native`) is the listening-first client. It prioritizes continuity, playback ergonomics, and eventual offline support, while remaining a pure consumer of backend authority.

## 2. Structure

### Layered Structure

- **Composition (`apps/native/src/app`)**: Expo Router navigation, route groups, layouts, and screen wiring.
- **Features (`apps/native/src/features/`)**: app-local feature slices — each owns screens, components, hooks, and utils.
- **Core (`@sd/core-*`)**: shared infrastructure such as auth, API access, and styling.
- **Domain (`@sd/domain-*`)**: shared data and state hooks used across both apps.
- **Shared (`apps/native/src/shared/` and `@sd/shared`)**: app-local primitives and cross-app utilities.

### Structural Rules

- Route composition stays in `app/`.
- Business rules do not live in route files.
- Mobile-specific persistence and playback mechanics belong in infrastructure or feature layers, not navigation.

## 3. Current Implementation State

Mobile has search, auth, catalog browsing, audio playback with progress tracking, My Library, offline audio downloads, local-first sync, and admin surfaces implemented. See §6 for the sync architecture and §7 for playback/downloads specifics.

The navigation surface has been reworked into a tabs-owned structure:

- the main app surface lives under `apps/native/src/app/(tabs)/`
- the shared tabs boundary is `apps/native/src/app/(tabs)/_layout.tsx`
- top-level sections are real tabs: explore, library, settings, and admin
- tab chrome UI is rendered by `apps/native/src/features/navigation/` components
- route state is the source of truth for active tab and subsection
- subsection selection happens inside each tab stack rather than through a shell-owned navigation store

This means mobile now uses Expo Router tabs for peer-root navigation, with app-local chrome layered over them for product-specific visuals.

## 4. Offline and Sync Principles

Offline support is implemented for selected personal listening state and
downloaded audio. It is intentionally narrow; catalog browsing remains
network-first and in-memory.

### Non-Negotiable Rules

- The backend remains the source of truth.
- Clients may record intent locally, not authoritative state.
- Offline mode never grants editorial or administrative capability.
- Synchronization is reconciliation, not peer authority.

## 5. Offline Data Model

Mobile data falls into three categories:

1. **Offline-readable**: downloaded audio (`apps/native/src/features/downloads/`).
2. **Offline-writable**: personal intent — progress and My Library saved state — recorded locally first and queued for sync via `@sd/core-sync`.
3. **Offline-only**: temporary UI state and device-local preferences.

Catalog/search/browse data is network-first and in-memory only (`QueryClientProvider`, no persister) — it is not available offline. Only progress, My Library saved state, and downloaded audio survive an app restart without connectivity.

## 6. Sync Architecture

`@sd/core-sync` is the shared local-first primitive, used by `@sd/domain-audio` (progress) and `@sd/domain-content` (My Library saved state) — the same logic on both web and native, differing only in which `StorageAdapter` each app injects (`apps/web/src/core/sync/local-storage-adapter.ts` wraps `localStorage`; `apps/native/src/core/sync/sqlite-kv-adapter.ts` wraps a dedicated `expo-sqlite` `kv_store` table in `sd-sync.db`).

- **Local writes are immediate and optimistic.** A save/unsave or a progress tick updates the local entity store before any network call. Progress and playback identity are keyed by `listingSlug`; internal database IDs are not client-facing identities.
- **Debounced background sync.** Changes are batched and pushed after a short debounce rather than on every write.
- **Persisted outbox.** Pending pushes are queued in a `createOutboxStore` instance backed by the platform's `StorageAdapter`, so a failed push (offline, crash, force-quit) survives and is retried on the next flush — not lost like an in-memory retry queue would be.

The client-side persisted progress outbox remains the recovery mechanism for
network/API failures. The server-side Redis buffer only reduces PostgreSQL
write frequency after a request has reached the API.

- **Outbox is namespaced per user** (`progress:${userId}`, `saved:${userId}`) so switching accounts on the same device never leaks or retries another user's queued writes.
- **Conflict resolution is last-write-wins by `updatedAt`**, mirroring the server's own `bulkSync` SQL (`INSERT ... ON CONFLICT DO UPDATE ... CASE WHEN updatedAt > ...`). Progress additionally merges `isCompleted` monotonically (a completion can't be un-completed by an older write); My Library saved state uses plain LWW on a `deletedAt` tombstone, since a later unsave must be able to override an earlier save and vice versa.
- **Delta hydration** pulls only what changed since the last sync via `?since=` on both the progress and My Library saved-state endpoints.
- **Drain triggers (native only):** `AppState` foreground and `expo-network` reconnect (`apps/native/src/core/network/network-status.ts`), wired in `apps/native/src/core/providers.tsx`. Web has no network-status listener — nothing on web currently needs one, since the debounced flush already covers the tab-stays-open case.

This is the implemented architecture, not a target — backend rules still resolve conflicts deterministically and clients still record intent rather than authority, matching §4.

## 7. Playback, Progress, and Offline Downloads

- `DurusAudioService` (`@sd/domain-audio`) resolves a track's playable URL by checking, in order: an already-resolved `file://` URI, an injected `localUriResolver` (native only, backed by the downloads registry), an existing remote URL, or a lazily-fetched signed stream URL. A downloaded lecture is preferred over streaming automatically — no separate "play offline" mode.
- Progress is throttled/debounced and idempotent, synced through the `@sd/core-sync` engine described in §6.
- Cross-device consistency is eventual, reconciled via last-write-wins on `updatedAt`.
- Downloads use `expo-file-system`'s `DownloadTask` API and a dedicated `expo-sqlite` registry (`sd-downloads.db`, table `downloads`) — genuinely relational/queryable, so it does not go through `@sd/core-sync`'s KV `StorageAdapter`. `apps/native/src/features/downloads/store/downloads.store.ts` is a Zustand read-cache hydrated from this registry on launch, so download state survives an app restart even though the in-flight native task itself does not. Removal and offline-initiated download retries go through the same downloads-namespaced outbox, device-scoped (not per-user, since downloaded files are shared across whoever is signed in on that device).

## 8. Mobile-Specific Constraints

- Persistence is narrow and repository-owned (progress, My Library saved state, downloads) — not a blanket cache. Catalog/browse data is network-first and in-memory only.
- It must not duplicate backend policy.
- It must not invent alternative sync semantics outside the documented outbox model (§6).
- Native admin screens are convenience clients for backend-protected
  mutations. Offline mode never enables admin actions, and native UI checks do
  not replace API authorization.

## 9. Navigation Surface

The tab bar is a product-specific navigation surface layered over a standard Expo Router `Tabs` navigator.

### Current Rules

- The tab chrome mounts once at the shared `(tabs)` layout boundary.
- Top-level section switches are owned by Expo Router tabs.
- Subsection routes live inside each tab stack.
- Current route state is authoritative for the active location.
- Default subsection routes are canonical tab paths like `/(tabs)/(explore)`,
  `/(tabs)/my-library`, and `/(tabs)/settings`.

### Ownership

- Top-level tab chrome lives in `apps/native/src/features/navigation/components/CustomTabBar.tsx`
- Subsection chrome lives in `apps/native/src/features/navigation/components/SubsectionBarHost.tsx`
- Shared route helpers for tabs live in `apps/native/src/features/navigation/utils/tab-route-config.ts`
- Native admin screens live under `apps/native/src/app/(tabs)/admin/` and
  `apps/native/src/features/admin/`.

### Package Discipline

- Route files in `apps/native/src/app/` stay thin and assemble package-owned screens.
- Feature packages own reusable mobile-native UI and route-facing screen components.
- Shared and core packages must not hide native-only code behind generic filenames or generic root exports.
- If code is mobile-native only, it must live in an explicit `.native.*` file and be exported through `index.native.ts`.
- If code is shared between native and web, it belongs in a platform-agnostic file and may be re-exported from both platform root entrypoints.

### Verification Status

- The `(tabs)` route group is restored as the main app boundary
- Mobile and web route defaults now align conceptually around explore,
  library, and settings/account surfaces, while each platform keeps its own
  route naming.
- Mobile and web typecheck/lint pass on the tabs migration
- Native runtime smoke coverage is still required to confirm the old shell-era crash is gone on device
