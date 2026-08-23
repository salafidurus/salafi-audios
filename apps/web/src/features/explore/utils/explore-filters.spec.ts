import { describe, expect, it } from "bun:test";

import {
  DEFAULT_EXPLORE_FILTERS,
  exploreFiltersStorageKey,
  readExploreFilters,
  sortExploreItems,
  writeExploreFilters,
} from "./explore-filters";

function createStorage(values: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(values));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
    clear: () => void data.clear(),
    key: (index) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  };
}

describe("Explore filter persistence", () => {
  it("namespaces state by surface, locale, and user identity", () => {
    expect(exploreFiltersStorageKey("ar", "user-1")).toBe(
      "salafi-durus:explore-filters:v1:ar:user-1",
    );
    expect(exploreFiltersStorageKey("en")).not.toBe(exploreFiltersStorageKey("en", "user-1"));
  });

  it("round-trips filters and falls back safely for malformed state", () => {
    const storage = createStorage();
    const key = exploreFiltersStorageKey("en", "user-1");
    const filters = {
      query: "aqeedah",
      scholar: "scholar-a",
      topic: "topic-a",
      format: "series",
      language: "ar",
      sort: "title-desc" as const,
    };

    writeExploreFilters(storage, key, filters);
    expect(readExploreFilters(storage, key)).toEqual(filters);

    storage.setItem(key, "not-json");
    expect(readExploreFilters(storage, key)).toEqual(DEFAULT_EXPLORE_FILTERS);
  });

  it("sorts catalog results without mutating the API response", () => {
    const items = [{ title: "Zayd" }, { title: "Abu Bakr" }];

    expect(sortExploreItems(items, "title-asc", "en")).toEqual([
      { title: "Abu Bakr" },
      { title: "Zayd" },
    ]);
    expect(sortExploreItems(items, "recent", "en")).toEqual(items);
    expect(items).toEqual([{ title: "Zayd" }, { title: "Abu Bakr" }]);
  });
});
