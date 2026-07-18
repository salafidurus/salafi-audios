// localStorage-based persister for TanStack Query
// Provides 24-hour offline cache for queries

const CACHE_KEY_PREFIX = "tq-cache-";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export interface CacheEntry {
  data: unknown;
  timestamp: number;
}

/**
 * Get cached query data from localStorage
 */
export function getCachedData(key: string): unknown | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;

    // Return null if cache expired
    if (age > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Persist query data to localStorage
 */
export function setCachedData(key: string, data: unknown): void {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Ignore quota errors
  }
}

/**
 * Clear all cached queries
 */
export function clearQueryCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore errors
  }
}
