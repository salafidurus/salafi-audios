// Type-resolution shim only. Metro selects native-progress.ios.tsx or
// native-progress.android.tsx; TypeScript does not understand platform suffixes.
export * from "./native-progress.ios";
