/** Bridges extensionless Button imports to the platform-specific native implementation. */
// Type-resolution shim only — never bundled. Metro resolves the extensionless
// "./Button" import to Button.ios.tsx or Button.android.tsx at build time for
// both platforms this app ships (see app.config.ts: platforms: ["ios", "android"]).
// TypeScript's own resolution doesn't know about the .ios/.android convention
// (its moduleSuffixes here only covers .native/.web), so without this file
// `tsc --noEmit` can't resolve the import at all.
export * from "./Button.ios";
