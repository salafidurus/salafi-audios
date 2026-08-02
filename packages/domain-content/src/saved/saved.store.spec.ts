import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "bun:test";

import {
  useSavedStore,
  useIsSaved,
  isSaved,
  getSavedIds,
  markSavedLocally,
  markUnsavedLocally,
} from "./saved.store";

// Register happy-dom globals before tests run — this package has no app-level
// test harness, so hook-rendering spec files set it up inline. Guarded because
// bun runs every *.spec.ts* file in this package in one process.
const { GlobalRegistrator } = require("@happy-dom/global-registrator");

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another spec file in this run.
}

describe("saved.store", () => {
  beforeEach(() => {
    useSavedStore.setState({ entities: {} });
  });

  it("isSaved is false for a listing with no entry", () => {
    expect(isSaved("l1")).toBe(false);
  });

  it("markSavedLocally makes isSaved true and appears in getSavedIds", () => {
    markSavedLocally("l1");

    expect(isSaved("l1")).toBe(true);
    expect(getSavedIds()).toEqual(["l1"]);
  });

  it("markUnsavedLocally tombstones rather than hard-deleting — isSaved becomes false but the entity remains", () => {
    markSavedLocally("l1");

    markUnsavedLocally("l1");

    expect(isSaved("l1")).toBe(false);
    expect(getSavedIds()).toEqual([]);
    expect(useSavedStore.getState().actions.get("l1")).toBeDefined();
    expect(useSavedStore.getState().actions.get("l1")?.deletedAt).toBeDefined();
  });

  it("markSavedLocally after markUnsavedLocally clears the tombstone again", () => {
    markSavedLocally("l1");
    markUnsavedLocally("l1");

    markSavedLocally("l1");

    expect(isSaved("l1")).toBe(true);
  });

  describe("useIsSaved", () => {
    it("reacts to markSavedLocally/markUnsavedLocally", () => {
      const { result } = renderHook(() => useIsSaved("l1"));
      expect(result.current).toBe(false);

      act(() => markSavedLocally("l1"));
      expect(result.current).toBe(true);

      act(() => markUnsavedLocally("l1"));
      expect(result.current).toBe(false);
    });
  });

  describe("slug carrying", () => {
    // The single-item save/unsave endpoint resolves by slug, not the stable
    // uuid `id` the store is keyed on — the entity must carry the slug
    // alongside the id so the sync layer's push has something resolvable.
    it("markSavedLocally stores the given slug on the entity", () => {
      markSavedLocally("l1", "tafsir-al-fatiha");

      expect(useSavedStore.getState().actions.get("l1")?.slug).toBe("tafsir-al-fatiha");
    });

    it("markUnsavedLocally preserves the slug recorded by an earlier markSavedLocally", () => {
      markSavedLocally("l1", "tafsir-al-fatiha");

      markUnsavedLocally("l1");

      expect(useSavedStore.getState().actions.get("l1")?.slug).toBe("tafsir-al-fatiha");
    });

    it("markUnsavedLocally can also record a slug directly (e.g. unsave-only flows)", () => {
      markUnsavedLocally("l1", "tafsir-al-fatiha");

      expect(useSavedStore.getState().actions.get("l1")?.slug).toBe("tafsir-al-fatiha");
    });
  });
});
