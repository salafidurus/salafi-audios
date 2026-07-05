# Expo Development Guide

Use context7 to query Expo documentation: `/websites/expo_dev`

## Project Structure (This Project)

Mobile app follows `apps/mobile/src/`:

```
app/       → Expo Router (file-based routing)
features/  → domain UI/hooks
core/      → API/auth/playback/sync
shared/    → pure primitives
```

## Expo Router

File-based routing similar to Next.js:

```
app/
├── _layout.tsx           # Root layout
├── index.tsx             # Home screen (/)
├── (tabs)/               # Tab group
│   ├── _layout.tsx       # Tab navigator
│   ├── feed.tsx          # /feed
│   └── library.tsx       # /library
└── [id].tsx              # Dynamic route
```

### Layouts

```typescript
import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

### Navigation

```typescript
import { router } from 'expo-router';

// Navigate
router.push('/details/123');
router.replace('/home');
router.back();

// Link component
import { Link } from 'expo-router';
<Link href="/details/123">Go to details</Link>
```

## Offline-First Rules (This Project)

- Clients record INTENT, not authority
- Use OUTBOX pattern for offline writes
- Backend resolves conflicts
- Offline mode NEVER enables admin actions

### Outbox Pattern

```typescript
// core/sync/outbox.ts
// Queue mutations when offline
// Sync when back online
// Backend reconciles state
```

## Animations (This Project)

Use `react-native-ease` with `EaseView`:

```typescript
import { EaseView } from 'react-native-ease';

<EaseView
  animate={{ opacity: 1, scale: 1 }}
  initialAnimate={{ opacity: 0, scale: 0.9 }}
  transition={{ type: 'spring', damping: 15, stiffness: 120 }}
>
  <Content />
</EaseView>
```

## Styling

Use `react-native-unistyles` with design tokens from `@sd/design-tokens`:

```typescript
import { createStyleSheet, useStyles } from "react-native-unistyles";
import { tokens } from "@sd/design-tokens";

const stylesheet = createStyleSheet({
  container: {
    padding: tokens.spacing.component.cardPadding,
    borderRadius: tokens.radius.component.card,
  },
});
```

## Commands

```bash
# Development
pnpm dev:mobile

# With prebuild (Android/iOS native)
pnpm dev:mobile:prebuild

# Build
pnpm --filter mobile build

# Lint
pnpm --filter mobile lint

# Test
pnpm --filter mobile test
pnpm --filter mobile test -- src/path/to/file.test.tsx
```

## EAS Build (requires EAS account)

```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build
eas build --profile preview

# Production build
eas build --profile production
```

## Documentation Lookup

When you need Expo docs, use context7:

```
Query context7 with library ID: /websites/expo_dev
```

Topics: Expo Router, navigation, file-based routing, layouts, tabs, stack, drawer, modal, deep linking, linking, splash screen, app icon, assets, fonts, images, camera, media library, audio, video, notifications, push notifications, location, sensors, gestures, haptics, permissions, storage, SQLite, secure store, file system, network, auth, updates (OTA), EAS Build, EAS Submit, EAS Update, config plugins, native modules, debugging, testing
