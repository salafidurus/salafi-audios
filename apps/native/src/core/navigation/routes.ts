/** Native tab paths remain Expo Router paths; web/API paths live in core-contracts. */
/** Renders the native const native routes = { surface and coordinates its user-facing state. */
export const nativeRoutes = {
  myLibrary: {
    index: "/my-library",
    saved: "/my-library/saved",
    completed: "/my-library/completed",
  },
} as const;
