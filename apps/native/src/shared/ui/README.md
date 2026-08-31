# Native UI foundation

This directory is the canonical home for new reusable native visual primitives.
Semantic colors, typography, spacing, radii, borders, and interaction states
come from `@sd/design-tokens` through the native Unistyles theme.

## Rendering vocabulary

- **Universal UI** uses the universal `@expo/ui` API for common behavior.
- **Platform UI** uses the SwiftUI or Jetpack Compose Expo UI APIs when native
  behavior materially differs between platforms.
- **RN fallback UI** is React Native visual UI retained for an explicit
  capability, performance, accessibility, or infrastructure gap.
- A **Bridge** is an explicit boundary between an Expo UI subtree and an RN
  subtree. `RNHostView` places RN content inside Expo UI; it is not a generic
  layout wrapper.
- A **Native UI primitive** owns semantic product behavior and token mapping,
  while delegating rendering to one of those approved mechanisms.

## Host ownership

Screen or feature roots own `NativeScreenHost`. Leaf primitives must not create
hidden hosts. `NativeBridgeHost` is reserved for an explicitly bridged RN child.
React Native continues to own navigation and safe-area shells; native content
must not add a second safe-area inset.

Existing shared components remain compatibility consumers during the expand
phase. Feature migration and compatibility removal are separate tickets.

The bridge registry marks files that import `RNHostView` as `bridge` entries;
React Native visual infrastructure that does not cross an Expo UI boundary is
recorded as `infrastructure` metadata instead.
