import type { LibraryItemDto } from "@sd/core-contracts";

import {
  markUnsaved,
  useLibraryProgressScreen,
  useLibrarySavedScreen,
  useLibraryCompletedScreen,
} from "@sd/domain-content";
import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { useAuth } from "@/core/auth/use-auth";

import { LibraryScreen } from "./library.screen";

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
  useLibraryProgressScreen: jest.fn(),
  useLibrarySavedScreen: jest.fn(),
  useLibraryCompletedScreen: jest.fn(),
  getLibraryItemPercent: (item: LibraryItemDto) => {
    if (item.totalLeafCount && item.totalLeafCount > 0) {
      return Math.round(((item.completedLeafCount ?? 0) / item.totalLeafCount) * 100);
    }
    if (item.durationSeconds && item.progressSeconds) {
      return Math.round((item.progressSeconds / item.durationSeconds) * 100);
    }
    return null;
  },
  markUnsaved: jest.fn(),
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
const mockedUseLibraryProgressScreen = jest.mocked(useLibraryProgressScreen);
const mockedUseLibrarySavedScreen = jest.mocked(useLibrarySavedScreen);
const mockedUseLibraryCompletedScreen = jest.mocked(useLibraryCompletedScreen);

function buildLibraryState(items: LibraryItemDto[] = [], isFetching = false) {
  return {
    items,
    hasMore: false,
    nextCursor: undefined,
    isFetching,
    error: null,
  };
}

const mockItem: LibraryItemDto = {
  id: "item-1",
  listingId: "lecture-1",
  listingTitle: "Library Lecture",
  listingSlug: "library-lecture",
  scholarId: "scholar-1",
  scholarSlug: "ibn-baz",
  scholarName: "Ibn Baz",
  seriesTitle: "Series",
  durationSeconds: 1800,
  progressSeconds: 600,
  savedAt: undefined,
  completedAt: undefined,
};

describe("LibraryScreen", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    });
    mockedUseLibraryProgressScreen.mockReturnValue(buildLibraryState());
    mockedUseLibrarySavedScreen.mockReturnValue(buildLibraryState());
    mockedUseLibraryCompletedScreen.mockReturnValue(buildLibraryState());
  });

  it("renders auth required message when not authenticated", async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    });

    await render(<LibraryScreen />);

    expect(screen.getByText("Sign in to access your library")).toBeTruthy();
  });

  it("renders a skeleton loading state while In Progress is fetching", async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
    });
    mockedUseLibraryProgressScreen.mockReturnValue(buildLibraryState([], true));

    await render(<LibraryScreen />);

    expect(screen.getByTestId("library-item-row-skeleton")).toBeTruthy();
  });

  it("renders empty section messages when no items exist", async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
    });

    await render(<LibraryScreen />);

    expect(screen.getByText("No lectures in progress.")).toBeTruthy();
  });

  it("switches to saved tab and renders empty state", async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
    });

    await render(<LibraryScreen />);

    await fireEvent.press(screen.getByTestId("library-pill-saved"));
    expect(
      screen.getByText("No saved lectures yet. Save lectures to listen to later."),
    ).toBeTruthy();
  });

  it("switches to completed tab and renders empty state", async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
    });

    await render(<LibraryScreen />);

    await fireEvent.press(screen.getByTestId("library-pill-completed"));
    expect(screen.getByText("No completed lectures yet. Keep listening!")).toBeTruthy();
  });

  it("navigates to a lecture when an item is pressed", async () => {
    const onNavigateToListing = jest.fn();

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
    });
    mockedUseLibraryProgressScreen.mockReturnValue(
      buildLibraryState([
        {
          ...mockItem,
          progressSeconds: 600,
          durationSeconds: 1800,
        },
      ]),
    );

    await render(<LibraryScreen onNavigateToListing={onNavigateToListing} />);

    await fireEvent.press(screen.getByText("Library Lecture"));

    expect(onNavigateToListing).toHaveBeenCalledWith("library-lecture");
  });

  it("marks a lecture as completed via the row's long-press action", async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
    });
    mockedUseLibraryProgressScreen.mockReturnValue(
      buildLibraryState([
        {
          ...mockItem,
          progressSeconds: 600,
          durationSeconds: 1800,
        },
      ]),
    );

    await render(<LibraryScreen />);
    await fireEvent.press(screen.getByTestId("library-progress-row-item-1-action-complete"));

    expect(mockMarkCompleted).toHaveBeenCalledWith("lecture-1");
  });

  it("removes a saved lecture via the row's long-press action", async () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
    });
    mockedUseLibrarySavedScreen.mockReturnValue(
      buildLibraryState([
        {
          ...mockItem,
          savedAt: "2024-01-01T00:00:00.000Z",
        },
      ]),
    );

    await render(<LibraryScreen />);

    await fireEvent.press(screen.getByTestId("library-pill-saved"));
    await fireEvent.press(screen.getByTestId("library-saved-row-item-1-action-remove"));

    expect(markUnsaved).toHaveBeenCalledWith("lecture-1", "library-lecture");
  });
});
