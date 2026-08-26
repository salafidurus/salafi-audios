import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "bun:test";

import { useLibraryProgressScreen } from "./use-library-progress";

// Register happy-dom globals before tests run — this package has no
// app-level test harness (unlike apps/web), so this hook test sets it up inline.
// Guarded because bun runs every *.spec.ts* file in this package in one process,
// and another spec file may have already registered it.
const { GlobalRegistrator } = require("@happy-dom/global-registrator");

try {
  GlobalRegistrator.register();
} catch {
  // Already registered by another spec file in this run.
}

const mockUseLibraryProgress = vi.fn();
const mockProgressMap: Record<string, any> = {};
const mockCurrentTrack = { value: null as any };

vi.mock("./library.api", () => ({
  useLibraryProgress: (...args: unknown[]) => mockUseLibraryProgress(...args),
}));

vi.mock("@sd/domain-audio", () => ({
  useProgressStore: (selector: (state: unknown) => unknown) =>
    selector({ progressMap: mockProgressMap }),
  usePlaybackStore: (selector: (state: unknown) => unknown) =>
    selector({ currentTrack: mockCurrentTrack.value }),
}));

const serverItem = {
  id: "l1",
  listingId: "l1",
  listingTitle: "Lecture One",
  listingSlug: "lecture-one",
  scholarId: "s1",
  scholarSlug: "scholar-1",
  scholarName: "Scholar One",
  durationSeconds: 1000,
  progressSeconds: 100,
};

describe("useLibraryProgressScreen", () => {
  beforeEach(() => {
    mockUseLibraryProgress.mockReset();
    for (const key of Object.keys(mockProgressMap)) delete mockProgressMap[key];
    mockCurrentTrack.value = null;
  });

  it("overlays live progress onto the server-fetched list when authenticated", () => {
    mockUseLibraryProgress.mockReturnValue({
      data: { items: [serverItem], hasMore: false, nextCursor: undefined },
      isFetching: false,
      error: null,
    });
    mockProgressMap[serverItem.listingSlug] = {
      listingSlug: serverItem.listingSlug,
      positionSeconds: 700,
      durationSeconds: 1000,
      updatedAt: "2026-01-01T00:00:05.000Z",
    };

    const { result } = renderHook(() => useLibraryProgressScreen(true));

    expect(result.current.items[0]?.progressSeconds).toBe(700);
  });

  it("returns local-only items when unauthenticated, ignoring server data", () => {
    mockUseLibraryProgress.mockReturnValue({
      data: { items: [serverItem], hasMore: false, nextCursor: undefined },
      isFetching: false,
      error: null,
    });

    const { result } = renderHook(() => useLibraryProgressScreen(false));

    expect(result.current.items).toEqual([]);
  });
});
