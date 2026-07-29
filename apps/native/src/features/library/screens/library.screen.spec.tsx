import type { LibraryItemDto } from "@sd/core-contracts";

import { useLibraryProgressScreen } from "@sd/domain-content";
import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { useAuth } from "@/core/auth/use-auth";

import { LibraryScreen } from "./library.screen";

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
  useLibraryCompletedScreen: jest.fn(),
  useLibrarySavedScreen: jest.fn(),
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

function buildLibraryState(items: LibraryItemDto[] = [], isFetching = false) {
  return {
    items,
    hasMore: false,
    nextCursor: undefined,
    isFetching,
    error: null,
  };
}

describe("LibraryScreen", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    });
    mockedUseLibraryProgressScreen.mockReturnValue(buildLibraryState());
  });

  it("renders a loading state while In Progress is fetching", async () => {
    mockedUseLibraryProgressScreen.mockReturnValue(buildLibraryState([], true));

    await render(<LibraryScreen />);

    expect(screen.getByText("Loading In Progress…")).toBeTruthy();
  });

  it("renders empty section messages when no items exist", async () => {
    await render(<LibraryScreen />);

    expect(screen.getByText("No lectures in progress.")).toBeTruthy();
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
        },
      ]),
    );

    await render(<LibraryScreen onNavigateToListing={onNavigateToListing} />);

    await fireEvent.press(screen.getByText("Library Lecture"));

    expect(onNavigateToListing).toHaveBeenCalledWith("library-lecture");
  });
});
