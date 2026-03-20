# AGENT.md - apps/mobile (Offline-First Client)

This Expo/React Native app prioritizes offline listening and resilient sync.

## Core Responsibilities

- Deliver reliable playback and offline continuity
- Queue user intent locally and sync safely
- Reflect backend-authoritative state after sync

## Agent skills scope

- If using Claude Code: Skills are defined at the root and listed in CLAUDE.md.
- If using OpenCode: Project-local skills live in `.opencode/skills/`.
- Keep mobile/Expo skills scoped to this app directory.

## Non-Negotiables

- Mobile is never the authority for protected state transitions
- Offline mode records intent only
- No admin/editorial authority while offline
- Backend resolves conflicts deterministically

---

## Offline Sync Rules

- Use an outbox pattern for offline-writable intents
- Outbox entries must be idempotent and retry-safe
- Sync on reconnect, foreground, periodic triggers, and explicit refresh
- Reconcile to backend truth after sync completion

---

## Structure and Dependency Direction

- `app/` — routing and composition
- `features/` — domain UX slices
- `core/` — API/auth/playback/persistence/sync infrastructure
- `shared/` — primitives/utilities

**Dependency direction:**

```file
app → features/*/screens
features/*/screens → features/*/components
features/*/components → core/shared
core → shared
shared → no inward deps
```

---

## UI Components

Most feature screens and shared UI components now come from `@sd/shared`, `@sd/feature-*`, and `@sd/core-*` packages:

- Search, browse, and results screens
- Auth screens (`SignInScreen`, `SignUpScreen`)
- Navigation shells (AdaptiveShell, SectionTabBar, etc.)
- Form/list primitives (Button, SearchInput, etc.)

Use the owning package `AGENT.md` and source folder for the current component inventory and styling patterns.

---

## Route Wrapper Pattern

`app/(auth)/` and other route files are **thin wrappers** — they import screens from the relevant `@sd/feature-*` package and wire callback props to `authClient` and `router`. No UI logic lives here.

```typescript
// apps/mobile/src/app/(auth)/sign-in.tsx
import { useRouter } from "expo-router";
import { SignInScreen } from "@sd/feature-auth";
import { authClient } from "@sd/core-auth";

export default function SignInPage() {
  const router = useRouter();
  return (
    <SignInScreen
      googleLogoSource={require("@/assets/auth/google-logo-light-1x.png")}
      onSignIn={async (email, password) => {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Sign in failed");
        router.replace("/");
      }}
      onSignInWithGoogle={() => authClient.signIn.social({ provider: "google" })}
      onSignInWithApple={() => authClient.signIn.social({ provider: "apple" })}
      onNavigateToSignUp={() => router.push("/sign-up")}
    />
  );
}
```

**Key rules:**

- Never import `authClient` inside shared feature packages when the app wrapper owns auth wiring
- Never import `expo-router` inside shared feature packages when navigation callbacks can be passed as props
- Asset paths use the `@/assets` alias (e.g., `require("@/assets/auth/google-logo-light-1x.png")`)

---

## Keyboard Handling

`KeyboardProvider` from `react-native-keyboard-controller` is mounted in `Providers.tsx` at app root. Any screen with form inputs **must** use `KeyboardAwareScrollView` from `react-native-keyboard-controller` (not plain `ScrollView`). This is already done for the shared auth screens in `@sd/feature-auth`.

---

## Brand Assets

- App icons/splash are configured in `apps/mobile/app.config.ts` and sourced from `apps/mobile/assets/images/*`
- In UI, use the brand logos from `apps/mobile/assets/images/logo/*` (avoid starter/template React logos)
- Auth logos live in `apps/mobile/assets/auth/`:
  - `google-logo-light-1x.png` — Google "G" logo (light background variant)

---

## API Contracts

- Import shared types from `@sd/contracts`
- Use query hooks from `@sd/contracts/query/hooks` for data fetching
- Initialize the API client once with `initApiClient()`

---

## Media Rules

- Consume backend-provided media references
- Never ship storage credentials in app code
- Treat downloads as continuity cache, not ownership

---

## Styling Rules

**Primary pattern — always use this:**

```typescript
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  screen: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
  },
  title: {
    ...theme.typography.titleLg,
    color: theme.colors.content.strong,
  },
  body: {
    ...theme.typography.bodyMd,
    color: theme.colors.content.default,
  },
}));
```

**Key rules:**

- Import `StyleSheet` from `react-native-unistyles`, **NOT** from `react-native`
- Use `StyleSheet.create((theme) => ({ ... }))` for all themed styles
- Typography spreads: `{ ...theme.typography.bodyMd, color: ... }` to inherit font/size/weight/line-height, then override color
- Use `useUnistyles()` only for dynamic/runtime conditions (insets, platform switches, or dynamic state)
- Design tokens from `@sd/design-tokens` for colors, spacing, radius, shadows, and typography

**Design token reference:**
See `packages/design-tokens/AGENT.md` for the complete design token guide (surface, border, content, spacing, radius, typography).

---

## Icons

Use two icon libraries:

- **`lucide-react-native`** — primary icon library (consistent, minimal designs)
- **`huge-icons`** (from `'huge-icons/react-native'`) — alternative/distinctive icons

Do not use `@expo/vector-icons`.

```typescript
import { Search } from 'lucide-react-native';
// OR for alternative designs: import { Search } from 'huge-icons/react-native';
import { useUnistyles } from 'react-native-unistyles';

export function SearchButton() {
  const { theme } = useUnistyles();
  return (
    <Search
      color={theme.colors.content.muted}
      size={24}
      strokeWidth={2}
    />
  );
}
```

**Props:**

- `color` — reference a design token (e.g., `theme.colors.content.muted`)
- `size` — numeric size in points
- `strokeWidth` — line weight (typically 1.5–2)

**Icon selection:**

- Prefer lucide-react-native for consistency
- Use huge-icons when lucide lacks an icon or for distinctive branding

---

## Animation Rules

This app prioritizes `react-native-ease` for animations. Use `react-native-reanimated` only as a fallback when EaseView cannot achieve the desired animation.

### When to use animations

Add animations to interactive elements to create a lively, tactile feel:

- **Press/click feedback**: Buttons, cards, list items — scale down + opacity change
- **Focus states**: Tab icons, selected items — scale up + opacity change
- **Icon interactions**: Back buttons, clear buttons, toggles — subtle scale changes
- **Entering elements**: Cards appearing, modals opening — fade + scale/translate

### Use spring physics, not timing

Spring animations feel more natural and tactile. Use spring for:

```typescript
// Spring (preferred) — natural, tactile feel
transition={{ type: "spring", damping: 10, stiffness: 100 }}
```

Only use timing when you need precise, deterministic animations:

```typescript
// Timing — use sparingly, only when precision matters
transition={{ type: "timing", duration: 200 }}
```

### Animation patterns

**Press animation (buttons, cards):**

```typescript
const [isPressed, setIsPressed] = useState(false);

<EaseView
  animate={{
    scale: isPressed ? 0.97 : 1,
    opacity: isPressed ? 0.88 : 1,
  }}
  transition={{ type: "spring", damping: 10, stiffness: 100 }}
>
  <Pressable
    onPressIn={() => setIsPressed(true)}
    onPressOut={() => setIsPressed(false)}
    ...
  />
</EaseView>
```

**Focus animation (tabs, selected items):**

```typescript
<EaseView
  animate={{
    scale: focused ? 1.08 : 1,
    opacity: focused ? 1 : 0.6,
  }}
  transition={{ type: "spring", damping: 12, stiffness: 120 }}
/>
```

**Icon press animation:**

```typescript
const [isPressed, setIsPressed] = useState(false);

<EaseView
  animate={{
    scale: isPressed ? 0.9 : 1,
    opacity: isPressed ? 0.7 : 1,
  }}
  transition={{ type: "spring", damping: 10, stiffness: 200 }}
>
  <Pressable
    onPressIn={() => setIsPressed(true)}
    onPressOut={() => setIsPressed(false)}
    ...
  />
</EaseView>
```

### Default spring values

| Use case              | damping | stiffness | Feel              |
| --------------------- | ------- | --------- | ----------------- |
| Buttons, cards        | 10      | 100       | Tactile, snappy   |
| Icons, small elements | 10      | 200       | Quick, responsive |
| Tabs, selected items  | 12      | 120       | Smooth, balanced  |

### Supported properties

EaseView supports: `opacity`, `translateX`, `translateY`, `scale`, `scaleX`, `scaleY`, `rotate`, `rotateX`, `rotateY`, `borderRadius`, `backgroundColor`

### Import

```typescript
import { EaseView } from "react-native-ease";
import { useState } from "react";
```

### Anti-patterns

- Don't use `withTiming` for press animations — springs feel better
- Don't animate layout properties (width, height, margin) — only use supported properties
- Don't use react-native-reanimated for simple state-driven animations — use EaseView
- Don't forget to add `useState` import when adding press animations

---

## Commands (run from repo root)

- Dev: `pnpm dev:mobile`
- Lint: `pnpm --filter mobile lint`
- Typecheck: `pnpm --filter mobile typecheck`
- Build: `pnpm --filter mobile build`
- Test: `pnpm --filter mobile test`

### Single-test commands

- Jest file: `pnpm --filter mobile test -- src/path/to/file.test.tsx`
- Jest by name: `pnpm --filter mobile test -- -t "renders heading"`
- Jest watch: `pnpm --filter mobile test:watch -- src/path/to/file.test.tsx`

---

## Quality Expectations

- Fail safely and explicitly; avoid silent drops
- Keep persistence/cache replaceable and non-authoritative
- Add tests for outbox behavior, retry semantics, and reconciliation paths

---

## Documentation Sync

When implementing features, update:

- `docs/AGENT.md` - Update implementation gap analysis and phase status when needed
- Relevant top-level docs file in `docs/` - If mobile architecture, offline rules, or platform boundaries change
