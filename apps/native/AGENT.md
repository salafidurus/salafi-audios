# AGENT.md - apps/native

This is the native mobile client (iOS + Android). It is the successor to `apps/mobile` and has fully replaced it. All 5 tabs (Search, Feed, Live, Library, Account) are implemented and verified on device.

## Rules

- This is the canonical native client. Do not modify `apps/mobile`.
- Keep feature slices thin: screens assemble package-owned hooks and components.
- Use `pnpm --filter native exec expo install <pkg>` to install dependencies so Expo picks the compatible version.
- Run `pnpm --filter native exec expo-doctor` after adding native dependencies.
- Verify UI changes on the Android emulator using local-expo-mcp tools.

## Commands

- Dev: `pnpm dev:native`
- Start: `pnpm --filter native start`
- Android: `pnpm --filter native android`
- iOS: `pnpm --filter native ios`
- Lint: `pnpm --filter native lint`
- Typecheck: `pnpm --filter native typecheck`
- Test: `pnpm --filter native test`
