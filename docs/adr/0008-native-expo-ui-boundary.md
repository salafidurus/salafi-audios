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

The native client exposes one canonical semantic foundation in
`apps/native/src/shared/ui`. Existing consumers may continue using compatibility
components during the expand phase, but new reusable visual primitives belong to
that foundation.

The foundation uses this vocabulary:

- **Universal UI** is a common component from the universal `@expo/ui` API.
- **Platform UI** is a SwiftUI or Jetpack Compose Expo UI component selected for
  materially platform-specific behavior.
- **RN fallback UI** is React Native visual UI retained for an explicit
  capability, performance, accessibility, or infrastructure gap.
- A **Bridge** is an explicit boundary between an Expo UI/platform-native tree
  and an RN tree. `RNHostView` is only for placing the RN child inside Expo UI.
- A **Native UI primitive** owns semantic product behavior and design-token
  mapping while delegating rendering to one approved mechanism.

The native client retains pure conversion functions in `core/styles/expo-ui`:

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

Screen or feature roots own the Host boundary. Leaf semantic primitives do not
create hidden Hosts. React Native remains the owner of navigation and safe-area
shells, and native content must not introduce a second safe-area inset.

Controlled native fields synchronize caller-owned React values into Expo UI's
observable native state. Text adapters expose only a supported children contract;
they must not silently flatten rich content. Native list abstractions distinguish
real Expo UI `List`/`ListItem` composition from ordinary vertical layout.

Every permanent visual RN bridge is recorded with its file, reason, owner, and
validation evidence. Temporary bridges additionally record a removal condition.
The migration guard compares detected visual RN usage with the registry in both
directions. Android is the current validation target; iOS remains explicitly
unverified until an iOS target is available.

## Consequences

Feature migration can adopt Expo UI primitives without creating app-owned
universal wrappers or silently dropping unsupported layout styles. React Native
containers continue to provide flex, margins, gaps, shadows, transforms, and
safe-area layout. Future platform-specific modifier use must remain explicit at
the call site.
