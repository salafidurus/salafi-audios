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

### Native UI foundation

New reusable native visual primitives belong in `apps/native/src/shared/ui/`.
That layer owns semantic contracts and maps product tokens from the native
Unistyles theme to Expo UI. Universal `@expo/ui` components are the default;
SwiftUI and Jetpack Compose are selected only for materially platform-specific
behavior. React Native visual UI is an explicit fallback for documented
capability, performance, accessibility, or infrastructure gaps.

Screen or feature roots own `Host` boundaries. `RNHostView` is reserved for
embedding a React Native child subtree inside Expo UI; it is not a generic
layout wrapper. React Native continues to own navigation and safe-area shells.
Existing shared components may delegate to the foundation while feature
migration proceeds incrementally.

## 3. Current Implementation State

Mobile has search, auth, catalog browsing, audio playback with progress tracking, My Library, offline audio downloads, local-first sync, and admin surfaces implemented. See §6 for the sync architecture and §7 for playback/downloads specifics.

The navigation surface uses five persistent listener-facing root destinations:

- Home
- Explore
- Scholars
- My Library
- Settings

The shared tabs boundary is `apps/native/src/app/(tabs)/_layout.tsx`. Each root
owns an independent Expo Router stack. Admin is an independent capability-aware
stack outside the persistent tab shell, and Search is a pushed global action.
Profile, Legal, and Support are secondary Settings screens. Started, Saved,
and Completed are internal My Library selections rather than root destinations.

Obsolete native subsection paths are intentionally invalid. They do not redirect
or alias to replacement screens and resolve through the localized normal
not-found state. The mini-player remains the sole bottom accessory while audio
is active.

This means mobile now uses Expo Router tabs for peer-root navigation, with app-local chrome layered over them for product-specific visuals.

### Home study surface

Home is the mobile study landing surface. Its public sections use the same
Catalog semantics as web: discovery, scholars, recently added material, and
curated promotions. Public sections remain available to anonymous listeners
and are queried independently from personal state.

Continue Listening is shown only after authentication resolves and only when
the authenticated unfinished-progress projection exists. It is not inferred
from Catalog data. Local playback progress may update the displayed position
immediately while the existing synchronization layer reconciles durable state.

Home does not cache the Catalog for offline use. Mobile continuity comes from
the existing downloaded-audio registry and local-first progress behavior; a
network failure must render a localized recoverable state rather than inventing
an offline Catalog result.

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
- Exactly five persistent root destinations are exposed to listeners.
- Root switching is owned by Expo Router tabs and each root preserves its own stack.
- Search, account, legal, support, and administrative screens are secondary or
  independent stack destinations, not persistent tabs.
- Removed native subsection paths remain invalid and are handled by the normal
  localized not-found route.

### Ownership

- Root route ownership lives in `apps/native/src/features/navigation/utils/tab-route-config.ts`
- Native admin screens live under `apps/native/src/app/admin/` and
  `apps/native/src/features/admin/`.

### Package Discipline

- Route files in `apps/native/src/app/` stay thin and assemble package-owned screens.
- Feature packages own reusable mobile-native UI and route-facing screen components.
- Shared and core packages must not hide native-only code behind generic filenames or generic root exports.
- If code is mobile-native only, it must live in an explicit `.native.*` file and be exported through `index.native.ts`.
- If code is shared between native and web, it belongs in a platform-agnostic file and may be re-exported from both platform root entrypoints.

### Verification Status

- The `(tabs)` route group is the main app boundary with five persistent roots.
- Mobile and web route defaults align conceptually around Home, Explore,
  Scholars, My Library, and Settings while each platform keeps its own route
  composition.
- Native runtime smoke coverage is required to confirm root navigation and the
  absence of the old shell-era crash on device.
