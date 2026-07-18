export const queryKeys = {
  // ========== NEVER CACHE ==========
  auth: {
    all: ["auth"] as const,
  },
  account: {
    all: ["account"] as const,
  },
  permissions: {
    all: ["permissions"] as const,
  },

  // ========== ADMIN SECTION ==========
  admin: {
    listings: {
      all: ["admin", "listings"] as const,
      infinite: () => ["admin", "listings", "infinite"] as const,
    },
    users: {
      all: ["admin", "users"] as const,
      infinite: () => ["admin", "users", "infinite"] as const,
    },
    scholars: {
      all: ["admin", "scholars"] as const,
      infinite: () => ["admin", "scholars", "infinite"] as const,
    },
  },

  // ========== LIBRARY (Personal, user-specific) ==========
  library: {
    progress: {
      all: ["library", "progress"] as const,
      infinite: () => ["library", "progress", "infinite"] as const,
    },
    saved: {
      all: ["library", "saved"] as const,
      infinite: () => ["library", "saved", "infinite"] as const,
    },
    completed: {
      all: ["library", "completed"] as const,
      infinite: () => ["library", "completed", "infinite"] as const,
    },
  },

  // ========== SEARCH ==========
  search: {
    all: ["search"] as const,
    infinite: (query: string) => ["search", "infinite", query] as const,
  },

  // ========== PUBLIC SCHOLARS & CONTENT ==========
  scholars: {
    list: {
      all: ["scholars", "list"] as const,
      infinite: () => ["scholars", "list", "infinite"] as const,
    },
    detail: (id: string) => ({
      all: ["scholars", id] as const,
      content: {
        all: ["scholars", id, "content"] as const,
        infinite: () => ["scholars", id, "content", "infinite"] as const,
      },
    }),
  },

  // ========== STATIC CATALOGS (Can cache) ==========
  listings: {
    all: ["listings"] as const,
  },
};
