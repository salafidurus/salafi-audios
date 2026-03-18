# AGENT.md - packages/ui-mobile

## Overview

Cross-platform UI component library used by both `apps/mobile` (native) and `apps/web` (transpiled via react-native-web). This package is the single source of truth for shared UI patterns, navigation shells, and feature screens.

**Exports via 3 index files:**

- `index.ts` — base exports and web fallback (used by bundlers when platform ambiguous)
- `index.native.ts` — native-only exports (used by mobile apps)
- `index.web.ts` — explicit web exports (used by Next.js via transpilePackages)

## Core Rules

- Keep this package UI-only and platform-agnostic where possible.
- Use platform splits when needed (`*.native.tsx`, `*.web.tsx`) instead of app-specific branching.
- Do not import from apps (`apps/*`).
- Keep feature UI presentational; backend/business authority remains in `apps/api`.
- Import shared contracts and tokens from workspace packages (`@sd/contracts`, `@sd/design-tokens`).
- Do not use TS path aliases to point directly into sibling package source trees.

---

## Styling Rules

**Primary pattern — always use this for themed styles:**

```typescript
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface.canvas,
    padding: theme.spacing.layout.pageX,
  },
  title: {
    ...theme.typography.titleMd,
    color: theme.colors.content.strong,
  },
}));
```

**Key rules:**

- Import `StyleSheet` from `react-native-unistyles`, **NOT** from `react-native`
- Use `StyleSheet.create((theme) => ({ ... }))` for all themed styles — theme is injected at creation time
- Theme tokens accessed via: `theme.colors.*`, `theme.spacing.*`, `theme.typography.*`, `theme.radius.*`, `theme.shadows.*`
- Typography spreads: `{ ...theme.typography.bodyMd, color: ... }` to inherit font/line-height/weight, then override color

**Secondary pattern — runtime dynamic styles only:**

```typescript
import { useUnistyles } from 'react-native-unistyles';

export function SomeComponent() {
  const { theme } = useUnistyles();
  // Use theme.colors.* only for conditional/dynamic style props or runtime decisions
  return <View style={{ borderColor: theme.colors.border.subtle }} />;
}
```

**Web-specific CSS properties (inside `.web.tsx` files only):**

```typescript
import { View } from "react-native-unistyles/components/native/*";
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    _web: {
      whiteSpace: "nowrap",
      display: "inline-block",
      overflowX: "hidden",
    },
  },
}));
```

- Import `View`, `Text`, `Pressable`, `Image` from `react-native-unistyles/components/native/*` (not `react-native`) to enable `_web` key
- `_web` properties override the style object on web; ignored on native
- Use for CSS-only properties (display, position, whiteSpace, etc.) that don't exist in React Native

---

## Icon Usage

We use two icon libraries across platforms:

- **lucide-react** (web via react-native-web) and **lucide-react-native** (native) — general UI icons
- **huge-icons** — available on both web and native for alternative designs

**Native (`.native.tsx`):**

```typescript
import { Search } from 'lucide-react-native';
// OR from 'huge-icons/react-native';
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

**Web (`.web.tsx`):**

```typescript
import { Search } from 'lucide-react';
// OR from 'huge-icons/react';
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

**Icon selection:**

- Prefer lucide for consistent, minimal icon designs
- Use huge-icons when lucide lacks an icon or for distinctive visual branding
- Props: `color={theme.colors.content.*}`, `size={number}`, `strokeWidth={number}`

**Type workaround (moduleSuffixes issue with react-native-svg web types):**

```typescript
import { ComponentType } from "react";
import { Search } from "lucide-react-native";

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
const SearchIcon = Search as IconComponent;
```

---

## Platform Split Patterns: Stable Imports

### `.native.tsx` stable imports

- **Animation:** `EaseView` from `react-native-ease` — spring-based animations (see apps/mobile/AGENT.md for full animation guide)
- **Safe area:** `useSafeAreaInsets()` from `react-native-safe-area-context`
- **Routing:** `useRouter`, `useSegments` from `expo-router`
- **Persistence:** `AsyncStorage` from `@react-native-async-storage/async-storage`
- **Lists:** `FlashList` from `@shopify/flash-list`
- **Blur:** `BlurView` from `expo-blur`
- **Haptics:** `expo-haptics` for tactile feedback
- **Keyboard:** `KeyboardAwareScrollView` from `react-native-keyboard-controller` — **always use this instead of `ScrollView` for any screen with form inputs**
- **OS branching:** `Platform.OS === "ios"` only for OS-level differences within native context (status bar colors, etc.)
- **Primitives:** `View`, `Text`, `Pressable`, `Image` from `react-native` — **always use `Pressable`, never `TouchableOpacity`**

### `.web.tsx` stable imports

- **Animation:** `motion.div` from `framer-motion` — same spring props as EaseView
- **RN wrappers:** `View`, `Text`, `Pressable`, `Image` from `react-native-unistyles/components/native/*` (enables `_web` key)
- **Routing:** `usePathname`, `useSearchParams`, `useRouter` from `next/navigation`
- **Persistence:** `localStorage` (Web Storage API)
- **Lists:** plain `View` + array `.map()` (no virtualization component; Framer Motion handles performance)
- **No safe area handling** — CSS manages it via `padding` / `max-width`
- **Primitives:** standard HTML elements or React Native wrappers

---

## Component File Structure Convention

```file
ComponentName/
├── ComponentName.tsx          # Shared types/props, or re-export .web
├── ComponentName.native.tsx   # Native implementation
├── ComponentName.web.tsx      # Web implementation
└── index.ts                   # Barrel: export * from "./ComponentName"
```

**How bundlers resolve it:**

- `ComponentName.tsx` typically does: `export * from "./ComponentName.web"`
- Bundlers automatically resolve `.native.tsx` over `.tsx` on native platforms
- Next.js (web) resolves `.web.tsx` or falls back to `.tsx`

---

## Animation Rules (Brief — see apps/mobile/AGENT.md for full guide)

**Native:**

- **Primary:** `react-native-ease` (`EaseView`) — use this first for all state-driven animations
- **Fallback:** `react-native-reanimated` — only when EaseView cannot achieve the animation
- Use spring (`type: 'spring'`) not timing curves for interactive feedback
- **Spring defaults:**
  - Buttons/cards: `{ damping: 10, stiffness: 100 }`
  - Icons/small elements: `{ damping: 10, stiffness: 200 }`
  - Tabs: `{ damping: 12, stiffness: 120 }`

**Web:**

- Use `framer-motion` (`motion.div`) with spring transitions
- ⚠️ **WARNING:** framer-motion does NOT work with react-native-web — only use in web-own components, never in shared ui-mobile components

---

## Navigation Components

Mobile navigation used by native and web (mobile/tablet viewports):

- **`AdaptiveShell`** — main navigation container, renders `SectionTabBar` + section content
- **`SectionLauncher`** — home screen with section cards
- **`SectionModeBar`** — inline toggle (list/grid/map view modes)
- **`SectionTabBar`** — bottom tab navigation for section switching
- **`SectionSwitcherSheet`** — modal sheet for switching sections
- **Shared store & types:** `SECTION_TABS`, `SECTION_ROUTES`, `SECTION_LABELS`, `getCurrentSection`, `getActiveTabFromPath`, `useNavigationStore`

**Usage:**

- Native: Always use these components
- Web: Render these components for mobile/tablet viewports (≤900px via `useResponsive`); use web sidebar for desktop
- All navigation state is managed in `src/features/navigation/store/navigation.store.ts` (shared between mobile and web)

---

## Auth Screens

`SignInScreen` and `SignUpScreen` are in `src/features/auth/` with `.native.tsx` and `.web.tsx` variants. They follow the **callback-prop pattern** — no direct imports of `authClient` or router.

### Props interface (both screens)

```typescript
// SignInScreen
type SignInScreenProps = {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignInWithGoogle: () => void;
  onSignInWithApple: () => void;
  onNavigateToSignUp: () => void;
  googleLogoSource?: ImageSourcePropType; // native only — pass require("@/assets/auth/google-logo-light-1x.png")
};

// SignUpScreen
type SignUpScreenProps = {
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onSignUpWithGoogle: () => void;
  onSignUpWithApple: () => void;
  onNavigateToSignIn: () => void;
  googleLogoSource?: ImageSourcePropType; // native only
};
```

### Platform implementations

**`.native.tsx`:**

- Uses `react-hook-form` (`Controller` + `useForm`, `mode: "onChange"`)
- Uses `KeyboardAwareScrollView` from `react-native-keyboard-controller` (never plain `ScrollView`)
- Apple sign-in uses `AppleAuthentication.AppleAuthenticationButton` from `expo-apple-authentication` (iOS only via `Platform.OS === "ios"`)
- Google logo passed as `googleLogoSource` prop — app passes `require("@/assets/auth/google-logo-light-1x.png")`
- All buttons are `Pressable` (never `TouchableOpacity`)
- Styles via `StyleSheet.create((theme) => ...)` from `react-native-unistyles`

**`.web.tsx`:**

- Standard HTML form with inline styles using CSS variables (`var(--action-primary)`, `var(--border-default)`, etc.)
- Uses `react-hook-form` (`register` + `useForm`, `mode: "onChange"`)
- Google logo: `/auth/google-logo-light-1x.png` (srcSet with 4x) — 22×22px
- Apple logo: `/auth/apple-logo-dark-1x.png` (srcSet with 3x) — 20×24px
- These paths resolve to `apps/web/public/auth/` since `.web.tsx` in ui-mobile is bundled by Next.js

### Sign-up specific: Terms & Conditions

Both sign-up implementations include a T&C checkbox that must be checked before any buttons (social or submit) are enabled.

### Form validation

- Email validated with `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` via RHF `pattern` rule
- All fields required; submit disabled via `isValid` from `formState`
- Invalid email highlights input border in `var(--state-danger)` / `theme.colors.state.danger`
- Field error shown below input in danger color

---

## Component Inventory

### Search & Browse

- **`SearchHomeScreen`** — idle search/browse landing screen
- **`SearchProcessingScreen`** — active search results view with loading states
- **`SearchInput`** — text input with optional icon
- **`SearchButton`** — pressable icon button variant
- **`SearchFilter`** — filter chip or dropdown (platform-specific rendering)
- **`SearchResultItem`** — individual result card (lecture, scholar, series, etc.)
- **`SearchResultsList`** — `UniversalList` wrapper for results
- **`SearchResultEmpty`** — empty state placeholder

### Browse Display

- **`BrowseCard`** — media card for topics/scholars/series
- **`QuickBrowse`** — section card for topic browsing shortcuts
- **`MarqueeText`** — scrolling text for long titles
- **`TitleText`** — styled heading (typography.titleMd)

### Layout & Structure

- **`Button`** — multi-variant button
  - Variants: `primary`, `surface`, `outline`, `ghost`, `danger`
  - Sizes: `sm`, `md`, `lg`
  - Slots: icon (start/end), label, optional loading state
- **`ScreenView`** — full-screen layout wrapper
  - Native: handles safe area insets
  - Web: adds page padding via CSS
- **`ScreenInProgress`** — "Coming Soon" placeholder screen
- **`UniversalList`** — cross-platform list virtualization
  - Native: `FlashList`
  - Web: `View` + `.map()`
  - Props: `data`, `renderItem`, `keyExtractor`, `horizontal`, `numColumns`, `scrollEnabled`

### App Infrastructure

- **`Providers`** — root context wrapper
  - `QueryClientProvider` for React Query
  - `initApiClient` setup (auth, base URLs, interceptors)
  - Design token theme provider (unistyles)

---

## Commands (run from repo root)

- Typecheck: `pnpm --filter ui-mobile typecheck`
- Lint: `pnpm --filter ui-mobile lint`
- Build: `pnpm --filter ui-mobile build`
