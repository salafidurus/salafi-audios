# Native Expo UI foundation

This directory is the only place new reusable visual primitives should be added.
All component colors, type, spacing, radii, and borders come from the native
adapter for `@sd/design-tokens`.

## Host ownership

- Mount one `NativeScreenHost` at a migrated screen boundary.
- Do not add a `Host` inside buttons, fields, list rows, or other leaf controls.
- Use `NativeBridgeHost` only when React Native content must be embedded inside
  an Expo UI tree.
- Use `RNHostView` for the reverse direction. `NativeImage` is the canonical
  remote-image bridge.

## Platform selection

Prefer universal `@expo/ui` components. Use `.ios.tsx` and `.android.tsx` files
only when the platform-native APIs are materially different, as with progress
indicators. Keep the unsuffixed file as a TypeScript-only resolution shim.

## Migration guard

`expo-ui-boundary.spec.ts` freezes the existing React Native visual-import debt.
A migration must reduce the baseline when it removes legacy imports. New visual
React Native imports, icon packages, or undocumented bridge files are rejected.
