import type { LibraryItemDto } from "@sd/core-contracts";

import { useLibraryCompletedScreen } from "@sd/domain-content";
import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { useAuth } from "@/core/auth/use-auth";

import { LibraryCompletedScreen } from "./library-completed.screen";

jest.mock("@sd/domain-content", () => ({
  useLibraryCompletedScreen: jest.fn(),
}));

jest.mock("../../../core/auth/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../../core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string, vars?: Record<string, unknown>) =>
      (fallback ?? _key).replace(/\{\{(\w+)\}\}/g, (_match: string, name: string) =>
        String(vars?.[name] ?? ""),
      ),
  }),
}));

const mockedUseAuth = jest.mocked(useAuth);
const mockedUseLibraryCompletedScreen = jest.mocked(useLibraryCompletedScreen);

const completedItem: LibraryItemDto = {
  id: "item-1",
  listingId: "lecture-1",
  listingTitle: "Completed Lecture",
  listingSlug: "completed-lecture",
  scholarId: "scholar-1",
  scholarSlug: "ibn-baz",
  scholarName: "Ibn Baz",
  seriesTitle: "Explanation Series",
  durationSeconds: 1800,
  progressSeconds: 1800,
  savedAt: undefined,
  completedAt: "2026-08-01T00:00:00Z",
};

function buildCompletedState(items: LibraryItemDto[] = [], isFetching = false) {
  return { items, hasMore: false, nextCursor: undefined, isFetching, error: null };
}

describe("LibraryCompletedScreen", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: undefined });
    mockedUseLibraryCompletedScreen.mockReturnValue(buildCompletedState());
  });

  it("uses an Expo UI host for the completed list and navigates from a row", async () => {
    const onNavigateToListing = jest.fn();
    mockedUseLibraryCompletedScreen.mockReturnValue(buildCompletedState([completedItem]));

    await render(<LibraryCompletedScreen onNavigateToListing={onNavigateToListing} />);

    expect(screen.getByTestId("library-completed-host")).toBeTruthy();
    expect(screen.getByText("Completed Lecture")).toBeTruthy();

    await fireEvent.press(screen.getByTestId("library-completed-row-item-1"));

    expect(onNavigateToListing).toHaveBeenCalledWith("completed-lecture");
  });
});
