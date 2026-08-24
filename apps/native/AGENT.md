# `apps/native` guidance

The Expo/React Native app is a client of the backend. Keep route files in
`src/app/` thin; feature slices own screens, hooks, and reusable mobile UI.
Platform bootstrap belongs in `src/core/`, and cross-feature primitives belong
in `src/shared/`.

Use `react-native-unistyles` with semantic tokens from `@sd/design-tokens`.
Do not hardcode visual tokens in native features. Use Expo-compatible package
versions and validate native dependency changes with the package's Expo checks.

Native UI changes require device validation through the configured Argent
workflow. Native tests use Jest and React Native Testing Library; follow the
package scripts for focused and full checks.

Native project files are current-checkout work. Shared-package-only changes use
the normal isolated worktree workflow unless the approved plan identifies
native generated/build coupling.
