import type { MyLibraryItemDto } from "@sd/core-contracts";

import { useMyLibrarySavedScreen } from "@sd/domain-content";
import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { useAuth } from "@/core/auth/use-auth";

import { MyLibrarySavedScreen } from "./my-library-saved.screen";

const mockMarkUnsaved = jest.fn();

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children }: { children: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require("react-native");
    return View(null, children);
  },
}));

jest.mock("@sd/domain-content", () => ({
  useMyLibrarySavedScreen: jest.fn(),
  markUnsaved: (...args: unknown[]) => mockMarkUnsaved(...args),
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
const mockedUseMyLibrarySavedScreen = jest.mocked(useMyLibrarySavedScreen);

const savedItem: MyLibraryItemDto = {
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
  savedAt: "2026-06-01T00:00:00Z",
  completedAt: undefined,
};

function buildSavedState(items: MyLibraryItemDto[] = [], isFetching = false) {
  return { items, hasMore: false, nextCursor: undefined, isFetching, error: null };
}

describe("MyLibrarySavedScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: undefined });
    mockedUseMyLibrarySavedScreen.mockReturnValue(buildSavedState());
  });

  it("renders an empty message when there are no saved items", async () => {
    await render(<MyLibrarySavedScreen />);
    expect(screen.getByText(/No saved lectures yet/)).toBeTruthy();
  });

  it("navigates to a lecture when an item is pressed", async () => {
    const onNavigateToListing = jest.fn();
    mockedUseMyLibrarySavedScreen.mockReturnValue(buildSavedState([savedItem]));

    await render(<MyLibrarySavedScreen onNavigateToListing={onNavigateToListing} />);
    await fireEvent.press(screen.getByText("MyLibrary Lecture"));

    expect(onNavigateToListing).toHaveBeenCalledWith("library-lecture");
  });

  it("calls markUnsaved with listingId and slug via the row's long-press action", async () => {
    mockedUseMyLibrarySavedScreen.mockReturnValue(buildSavedState([savedItem]));

    await render(<MyLibrarySavedScreen />);
    await fireEvent.press(screen.getByTestId("my-library-saved-row-item-1-action-remove"));

    expect(mockMarkUnsaved).toHaveBeenCalledWith("lecture-1", "library-lecture");
  });
});
