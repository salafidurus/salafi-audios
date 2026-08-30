# ADR 0008: Keep the Expo UI boundary thin and explicit

- Status: Accepted
- Date: 2026-08-30

## Context

Expo UI 57 universal components accept a deliberately small `UniversalStyle`
subset. Layout concerns remain React Native concerns, while typography uses a
separate `UniversalTextStyle` shape. The native application already owns
semantic colors, locale-specific font families, safe-area padding, and locale
direction through its assembled Unistyles theme.

## Decision

The native client exposes pure conversion functions in `core/styles/expo-ui`:

- `toUniversalStyle` accepts only Expo UI's supported box and paint properties.
- `toUniversalTextStyle` maps native typography variants separately.
- `createUniversalHostProps` maps direction and resolved explicit appearance,
  and sets `ignoreSafeArea="all"` so `ScreenView` remains the sole safe-area
  owner.

`ScreenView` wraps its existing React Native layout tree in a flex-filling
universal `Host`. The Host receives an explicit `colorScheme` only for a
resolved light or dark preference; system preference is left to the platform.
The application does not use Expo UI `seedColor` to replace its semantic
palette.

## Consequences

Feature migration can adopt Expo UI primitives without creating app-owned
universal wrappers or silently dropping unsupported layout styles. React Native
containers continue to provide flex, margins, gaps, shadows, transforms, and
safe-area layout. Future platform-specific modifier use must remain explicit at
the call site.
