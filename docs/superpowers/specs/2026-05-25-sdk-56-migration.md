# Plan: Migrate to Expo SDK 56

## Context

This app is currently on Expo SDK 55 / React Native 0.83.4. SDK 56 ships with RN 0.85, Hermes v1 by default, mandatory New Architecture (already active), and production-ready `@expo/ui` Universal Components. The migration has several breaking changes but the pre-migration audit revealed the codebase is cleaner than expected — flash-list, @gorhom/bottom-sheet, and react-navigation are all listed as deps but largely unused in production code, which simplifies migration significantly.

**User decisions captured:**
- **@expo/ui**: Adopt — replace key components (BottomSheet, primitives going forward)
- **StatusBar + NavigationBar**: Adopt both declarative components in root layout
- **flash-list**: Heavy assumed usage turned out to be a single unused wrapper — minimal migration needed
- **Hermes v1**: Accept SDK default (no explicit config)

**Monorepo note:** The native app's pnpm package name is `native` (not `@sd/native`). All pnpm filter commands use `--filter native`.

---

## Critical Files

- `apps/native/package.json` — dependency management (package name: `native`)
- `apps/native/app.config.ts` — Expo config, plugins, Sentry wrapper, experiments
- `apps/native/babel.config.cjs` — worklets + unistyles plugins
- `apps/native/metro.config.cjs` — Sentry metro wrapper
- `apps/native/src/app/_layout.tsx` — root layout (StatusBar/NavigationBar go here)
- `apps/native/src/core/providers.tsx` — root providers (KeyboardProvider, GestureHandlerRootView)
- `apps/native/src/core/styles/unistyles.ts` — theme definitions
- `apps/native/src/core/integrations.ts` — Sentry init + wrap
- `apps/native/src/shared/components/UniversalList/UniversalList.tsx` — only flash-list consumer

---

## Stage 1 — Core SDK Upgrade

### 1.1 Upgrade packages

Run from the **workspace root** using pnpm exec to preserve pnpm lockfile resolution:

```bash
# From workspace root
pnpm --filter native exec npx expo install expo@latest
pnpm --filter native exec npx expo install --fix
```

Running `npx expo install` directly inside `apps/native` bypasses pnpm workspace hoisting and can diverge `pnpm-lock.yaml`.

This pins all Expo-managed packages (react-native → 0.85, expo-router, expo-status-bar, etc.) to SDK 56 compatible versions.

### 1.2 Run diagnostics

Run after `--fix` has resolved the full dependency graph:

```bash
pnpm --filter native exec npx expo-doctor
```

Fix any reported issues before proceeding.

### 1.3 JS-layer verification checkpoint

Before touching native, verify the JS layer compiles cleanly:

```bash
pnpm --filter native typecheck
pnpm --filter native exec npx expo start --clear
```

Metro should start without errors. Fix any TypeScript regressions before Stage 2.

### 1.4 Upgrade Sentry

`@sentry/react-native` is on v7.11.0 — too old for RN 0.85. Upgrade:

```bash
pnpm --filter native add @sentry/react-native@latest
```

Review Sentry API changes across **all three** Sentry-touching files:
- `apps/native/metro.config.cjs` — `getSentryExpoConfig` wrapper
- `apps/native/src/core/integrations.ts` — `Sentry.init()`, `Sentry.wrap()`
- `apps/native/app.config.ts` — both the `@sentry/react-native/expo` plugin entry (plugins array) and the `withSentry(...)` wrapper at the bottom. The `withSentry` options API changed in v8+.

### 1.5 Check `react-native-keyboard-controller` compatibility

`react-native-keyboard-controller` 1.20.7 wraps the entire app tree via `<KeyboardProvider>` in `providers.tsx`. It has known issues with RN 0.84+ on Android due to `ReactRootView` changes. Upgrade to 1.22+ which added RN 0.85 support:

```bash
pnpm --filter native add react-native-keyboard-controller@latest
```

### 1.6 Check `react-native-worklets` compatibility

`react-native-worklets` 0.7.2 is used as a Babel plugin in `babel.config.cjs`. Verify it compiles against RN 0.85 after upgrade. If a newer version is available with RN 0.85 support, upgrade it:

```bash
pnpm --filter native add react-native-worklets@latest
```

Confirm the `babel.config.cjs` plugin reference still works after the upgrade.

---

## Stage 2 — Breaking Change Resolutions

### 2.1 flash-list v4 migration

`@shopify/flash-list` must be v4+ for SDK 56. Only usage is `UniversalList.tsx` (a wrapper not consumed by any screen yet). Upgrade the package:

```bash
pnpm --filter native add @shopify/flash-list@latest
```

Update `UniversalList.tsx` for v4 API changes. The critical required addition is `estimatedItemSize` — v4 makes this prop mandatory and will throw in dev builds without it. Ensure the wrapper either accepts and forwards `estimatedItemSize` or provides a sensible default.

### 2.2 expo/fetch as globalThis.fetch

SDK 56 makes `expo/fetch` the default `globalThis.fetch`. Audit `packages/core-api/` to ensure the API client is not relying on Node-specific fetch behavior. Check `@better-auth/expo` compatibility with this change.

### 2.3 expo-router / react-navigation cleanup

`expo-router` no longer depends on `react-navigation` internally. The project has `@react-navigation/elements` and `@react-navigation/native` listed as direct deps but no direct imports in source. After `--fix`, verify these are still needed as transitive deps; remove if expo-router no longer requires them.

### 2.4 expo-file-system async copy/move

`copy()` and `move()` in `expo-file-system` are now async. The download engine stub (`download.engine.ts`) references these — update the stubs to `await` calls to prevent future bugs when the implementation is filled in.

### 2.5 Remove stale config

In `app.config.ts`:
- Remove `newArchEnabled: true` if present (it's now the default, field is redundant)
- Remove `sdkVersion` if present (let Expo manage it automatically)

---

## Stage 3 — @expo/ui & expo-navigation-bar: Install Everything, Then Prebuild Once

Install all new native dependencies **before** running prebuild to avoid multiple expensive rebuilds (each `prebuild --clean` + pod install takes 5–15 minutes).

### 3.1 Install @expo/ui

```bash
pnpm --filter native add @expo/ui
```

Then add the config plugin to `apps/native/app.config.ts` in the `plugins` array:

```ts
plugins: [
  // ... existing plugins
  "@expo/ui",
],
```

Without this plugin entry, `@expo/ui` native modules will not link correctly during prebuild and components like `BottomSheet` will throw a native module not found error at runtime.

### 3.2 Install expo-navigation-bar

```bash
pnpm --filter native add expo-navigation-bar
```

### 3.3 Add rnrepo for faster native builds

[rnrepo](https://github.com/software-mansion/rnrepo) by Software Mansion distributes pre-compiled native library artifacts. Instead of compiling `react-native-reanimated`, `react-native-gesture-handler`, and 50+ other libraries from source on every prebuild, it downloads signed pre-built binaries — roughly 2× faster native builds.

Requirements are already met: New Architecture is active, RN 0.85 is supported.

```bash
pnpm --filter native add -D @rnrepo/expo-config-plugin
```

Add to `apps/native/app.config.ts` plugins array:

```ts
plugins: [
  // ... existing plugins
  "@expo/ui",
  "@rnrepo/expo-config-plugin",
],
```

### 3.4 Run single combined prebuild

Now that all new native modules are installed and their config plugins are registered, run a single prebuild:

```bash
pnpm --filter native exec npx expo prebuild --clean
```

This regenerates `ios/` and `android/` for RN 0.85 with all new native modules linked in one pass.

### 3.4 Verify native build on both platforms

```bash
pnpm --filter native exec npx expo run:ios
pnpm --filter native exec npx expo run:android
```

App must launch without crashes before Stage 4. Test:
1. Auth flow (login, Apple sign-in)
2. Audio playback
3. Navigation between all tab screens

---

## Stage 4 — @expo/ui Universal Components

### 4.1 Replace @gorhom/bottom-sheet

`@gorhom/bottom-sheet` (v5.2.8) has zero usages in the codebase. Remove it and establish `@expo/ui`'s `BottomSheet` as the standard:

```bash
pnpm --filter native remove @gorhom/bottom-sheet
```

Create a thin wrapper at `src/shared/components/Sheet/Sheet.tsx` that re-exports `@expo/ui`'s BottomSheet with project-specific defaults (snap points, handle styles matching the unistyles theme).

### 4.2 Evaluate other primitives for new code

For new screens, prefer `@expo/ui` primitives:
- `Button` over custom button components
- `Switch` over react-native Switch
- `Slider` over any third-party slider
- `TextInput` for new input fields

No mass-replacement of existing components — new code only. BottomSheet is the only hard replacement.

---

## Stage 5 — StatusBar & NavigationBar

### 5.1 Integrate into root layout

Update `apps/native/src/app/_layout.tsx`. Use `rt.colorScheme` from unistyles v3's `useUnistyles()` for dark mode detection — **the theme object has no `isDark` field**. The `NavigationBar` prop for icon color is `buttonStyle`, not `style`.

```tsx
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { useUnistyles } from 'react-native-unistyles';

function RootLayout() {
  const { theme, rt } = useUnistyles();
  const isDark = rt.colorScheme === 'dark';

  return (
    <Providers>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationBar
        backgroundColor={theme.colors.background}
        buttonStyle={isDark ? 'light' : 'dark'}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(content)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </Providers>
  );
}
```

SDK 56's `<StatusBar>` and `<NavigationBar>` support prop merging in mount order — screen-level overrides work automatically without imperative calls.

### 5.2 Full-screen screen overrides

For media playback screens (`features/audio/` player screens) and any other full-screen experiences, override StatusBar and NavigationBar per-screen using the same components at screen level.

---

## Stage 6 — Dependency Cleanup

| Package | Action | Reason |
|---------|--------|--------|
| `@gorhom/bottom-sheet` | Remove | Replaced by @expo/ui BottomSheet (Stage 4) |
| `react-native-ease` | Audit | Check RN 0.85 compatibility; remove if incompatible |
| `@react-navigation/elements` | Audit | Verify still needed as transitive dep after expo-router update |
| `@react-navigation/native` | Audit | Verify still needed as transitive dep after expo-router update |

---

## Verification

### After Stage 1 (JS layer)
- `pnpm --filter native typecheck` — zero errors
- Metro starts cleanly, app loads in Expo Go / dev client

### After Stage 3 (native rebuild)
1. `npx expo run:ios` — app launches without crashes
2. `npx expo run:android` — app launches without crashes
3. Auth flow works (login, Apple sign-in)
4. Audio playback works
5. Navigation between all tab screens works

### After Stage 4 (@expo/ui)
1. The new Sheet wrapper renders correctly on both platforms
2. BottomSheet opens/closes with correct snap behavior

### After Stage 5 (StatusBar/NavigationBar)
1. Light/dark mode toggle changes StatusBar text colour correctly on both platforms
2. Android NavigationBar background colour and button icons match app theme
3. Full-screen player screen has correct system bar appearance

### Bundle analysis with Expo Atlas

Expo Atlas is built into Expo CLI — no installation needed. After the migration, run a bundle analysis to catch any size regressions introduced by new dependencies (`@expo/ui`, `expo-navigation-bar`):

```bash
# Development bundle (quick check)
EXPO_ATLAS=1 pnpm --filter native exec npx expo start

# Production bundle (accurate sizes)
EXPO_ATLAS=1 pnpm --filter native exec npx expo export --platform ios
EXPO_ATLAS=1 pnpm --filter native exec npx expo export --platform android
npx expo-atlas .expo/atlas.jsonl
```

In dev mode, open the Atlas viewer via **Shift+M** in the Metro terminal. Look for unexpectedly large new contributors from `@expo/ui` or any tree-shaking gaps.

### Final
```bash
pnpm --filter native exec npx expo-doctor
```
Should report no issues.
