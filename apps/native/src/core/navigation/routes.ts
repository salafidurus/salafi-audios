/** Native tab paths remain Expo Router paths; web/API paths live in core-contracts. */
/** Describes the const nativeRoutes = { native contract and behavior. */
export const nativeRoutes = {
  myLibrary: {
    index: "/my-library",
    saved: "/my-library/saved",
    completed: "/my-library/completed",
  },
} as const;
