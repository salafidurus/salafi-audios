/** Native tab paths remain Expo Router paths; web/API paths live in core-contracts. */
export const nativeRoutes = {
  myLibrary: {
    index: "/my-library",
    saved: "/my-library/saved",
    completed: "/my-library/completed",
  },
} as const;
