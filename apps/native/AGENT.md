# AGENT.md - apps/native

Native mobile client (iOS + Android). All 5 tabs (Search, Feed, Live, Library, Account) are implemented and verified on device.

## Rules

- Keep feature slices thin: screens assemble package-owned hooks and shared components.
- Use `bun expo install <pkg>` to install dependencies so Expo picks the compatible version.
- Run `bun run expo:check` after adding native dependencies.
- Verify UI changes on the Android emulator using Argent MCP tools.

## Source structure

```text
src/
  app/        ← Expo Router — routing only
  features/   ← one folder per feature; owns components, hooks, screens
  shared/     ← components/hooks shared across 2+ features
  core/       ← platform bootstrap (providers, config, auth)
```

## Styling

- Use `react-native-unistyles` with the theme from `@sd/design-tokens`.
- Access tokens in `StyleSheet.create((theme) => ...)` or via `useUnistyles()`.
- See `packages/design-tokens/AGENT.md` for the full token reference.

## Testing

- Test runner: **jest** (not vitest — packages use vitest; native uses jest).
- RTL version: `@testing-library/react-native` v14 — `render` and `fireEvent` are async; always `await` them.
- Text must be wrapped in `<Text>` for RTL queries to find it.
- Single file: `bun run test -- src/features/account/screens/account.screen.spec.tsx`
- By name: `bun run test -- -t "renders loading state"`
- Watch: `bun run test:watch -- src/features/account/screens/account.screen.spec.tsx`

## Android dev client

- Metro runs on port 8081; API proxy on port 4000.
- Run `adb reverse tcp:8081 tcp:8081 && adb reverse tcp:4000 tcp:4000` before connecting the dev client.
- Use `localhost` in the dev client URL — not the LAN IP.
