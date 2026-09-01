import type { MyLibraryItemDto } from "@sd/core-contracts";

import { useMyLibrarySections } from "@sd/domain-content";
import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { useAuth } from "@/core/auth/use-auth";

import { MyLibraryScreen } from "./my-library.screen";

const mockMarkCompleted = jest.fn();

jest.mock("@sd/domain-audio", () => ({
  useProgressStore: jest.fn((selector: (state: unknown) => unknown) =>
    selector({ actions: { markCompleted: mockMarkCompleted } }),
  ),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require("react-native");
    return View(null, children);
  },
}));

jest.mock("@sd/domain-content", () => ({
  useMyLibrarySections: jest.fn(),
  getMyLibraryItemPercent: (item: MyLibraryItemDto) => {
    if (item.totalLeafCount && item.totalLeafCount > 0) {
      return Math.round(((item.completedLeafCount ?? 0) / item.totalLeafCount) * 100);
    }
    if (item.durationSeconds && item.progressSeconds) {
      return Math.round((item.progressSeconds / item.durationSeconds) * 100);
    }
    return null;
  },
}));

jest.mock("../../../core/auth/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string, vars?: Record<string, unknown>) =>
      (fallback ?? _key).replace(/\{\{(\w+)\}\}/g, (_m: string, name: string) =>
        String(vars?.[name] ?? ""),
      ),
    i18n: { language: "en" },
  }),
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseMyLibrarySections = jest.mocked(useMyLibrarySections);

function buildMyLibraryState(items: MyLibraryItemDto[] = [], isFetching = false) {
  return {
    items,
    hasMore: false,
    nextCursor: undefined,
    isFetching,
    error: null,
    refetch: jest.fn(),
  };
}

describe("MyLibraryScreen", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    });
    mockedUseMyLibrarySections.mockReturnValue({
      started: buildMyLibraryState(),
      saved: buildMyLibraryState(),
      completed: buildMyLibraryState(),
    });
  });

  it("renders a loading state while Started is fetching", async () => {
    mockedUseMyLibrarySections.mockReturnValue({
      started: buildMyLibraryState([], true),
      saved: buildMyLibraryState(),
      completed: buildMyLibraryState(),
    });

    await render(<MyLibraryScreen />);

    expect(screen.getByText("Loading Started…")).toBeTruthy();
  });

  it("renders empty section messages when no items exist", async () => {
    await render(<MyLibraryScreen />);

    expect(screen.getByText("Nothing here yet.")).toBeTruthy();
  });

  it("navigates to a lecture when an item is pressed", async () => {
    const onNavigateToListing = jest.fn();

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
    });
    mockedUseMyLibrarySections.mockReturnValue({
      started: buildMyLibraryState([
        {
          id: "item-1",
          listingId: "lecture-1",
          listingTitle: "MyLibrary Lecture",
          listingSlug: "library-lecture",
          scholarId: "scholar-1",
          scholarSlug: "ibn-baz",
          scholarName: "Ibn Baz",
          seriesTitle: "Series",
          durationSeconds: 1800,
          progressSeconds: 600,
          savedAt: undefined,
          completedAt: undefined,
        },
      ]),
      saved: buildMyLibraryState(),
      completed: buildMyLibraryState(),
    });

    await render(<MyLibraryScreen onNavigateToListing={onNavigateToListing} />);

    await fireEvent.press(screen.getByText("MyLibrary Lecture"));

    expect(onNavigateToListing).toHaveBeenCalledWith("library-lecture");
  });

  it("marks a lecture as completed via the row's long-press action", async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
    });
    mockedUseMyLibrarySections.mockReturnValue({
      started: buildMyLibraryState([
        {
          id: "item-1",
          listingId: "lecture-1",
          listingTitle: "MyLibrary Lecture",
          listingSlug: "library-lecture",
          scholarId: "scholar-1",
          scholarSlug: "ibn-baz",
          scholarName: "Ibn Baz",
          seriesTitle: "Series",
          durationSeconds: 1800,
          progressSeconds: 600,
          savedAt: undefined,
          completedAt: undefined,
        },
      ]),
      saved: buildMyLibraryState(),
      completed: buildMyLibraryState(),
    });

    await render(<MyLibraryScreen />);
    await fireEvent.press(screen.getByTestId("my-library-started-row-item-1-action-complete"));

    expect(mockMarkCompleted).toHaveBeenCalledWith("lecture-1");
  });

  it("switches to Saved and renders the selected section internally", async () => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: undefined });
    mockedUseMyLibrarySections.mockReturnValue({
      started: buildMyLibraryState(),
      saved: buildMyLibraryState([
        {
          id: "saved-1",
          listingId: "lecture-2",
          listingTitle: "Saved Lecture",
          listingSlug: "saved-lecture",
          scholarId: "scholar-1",
          scholarSlug: "ibn-baz",
          scholarName: "Ibn Baz",
        },
      ]),
      completed: buildMyLibraryState(),
    });

    await render(<MyLibraryScreen />);
    await fireEvent.press(screen.getByText("Saved"));

    expect(screen.getByText("Saved Lecture")).toBeTruthy();
    expect(screen.getAllByTestId("my-library-saved-row-saved-1").length).toBeGreaterThan(0);
  });
});
