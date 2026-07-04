import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import type { LibraryItemDto } from "@sd/core-contracts";
import {
  useLibraryCompletedScreen,
  useLibraryProgressScreen,
  useLibrarySavedScreen,
} from "@sd/domain-content";
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

// SectionList uses @react-native/virtualized-lists which bundles its own react-native
// copy that triggers native bridge assertions in Jest. Mock it at the module level.
jest.mock("react-native/Libraries/Lists/SectionList", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  function MockSectionList({
    sections = [],
    renderSectionHeader,
    renderItem,
    renderSectionFooter,
  }: {
    sections?: { title: string; data: unknown[] }[];
    renderSectionHeader?: (info: {
      section: { title: string; data: unknown[] };
    }) => React.ReactNode;
    renderItem?: (info: {
      item: unknown;
      section: { title: string; data: unknown[] };
      index: number;
      separators: Record<string, unknown>;
    }) => React.ReactNode;
    renderSectionFooter?: (info: {
      section: { title: string; data: unknown[] };
    }) => React.ReactNode;
  }) {
    return React.createElement(
      "View",
      null,
      sections.flatMap((section) => [
        renderSectionHeader ? renderSectionHeader({ section }) : null,
        ...section.data.map((item, index) =>
          renderItem ? renderItem({ item, section, index, separators: {} }) : null,
        ),
        renderSectionFooter ? renderSectionFooter({ section }) : null,
      ]),
    );
  }
  MockSectionList.displayName = "SectionList";
  return { default: MockSectionList };
});

jest.mock("@sd/domain-content", () => ({
  useLibraryCompletedScreen: jest.fn(),
  useLibraryProgressScreen: jest.fn(),
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

  it("renders a loading state while all sections are fetching", async () => {
    mockedUseLibraryProgressScreen.mockReturnValue(buildLibraryState([], true));
    mockedUseLibrarySavedScreen.mockReturnValue(buildLibraryState([], true));
    mockedUseLibraryCompletedScreen.mockReturnValue(buildLibraryState([], true));

    await render(<LibraryScreen />);

    expect(screen.getByText("Loading My Library…")).toBeTruthy();
  });

  it("renders empty section messages when no items exist", async () => {
    await render(<LibraryScreen />);

    expect(screen.getByText("In Progress")).toBeTruthy();
    expect(screen.getByText("No lectures in progress.")).toBeTruthy();
    expect(screen.getByText("Saved")).toBeTruthy();
    expect(screen.getByText("No saved lectures yet.", { exact: false })).toBeTruthy();
    expect(screen.getByText("Completed")).toBeTruthy();
    expect(screen.getByText("No completed lectures yet.", { exact: false })).toBeTruthy();
  });

  it("navigates to a lecture when an item is pressed", async () => {
    const onNavigateToLecture = jest.fn();

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: undefined,
    });
    mockedUseLibraryProgressScreen.mockReturnValue(
      buildLibraryState([
        {
          id: "item-1",
          lectureId: "lecture-1",
          lectureTitle: "Library Lecture",
          lectureSlug: "library-lecture",
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

    await render(<LibraryScreen onNavigateToLecture={onNavigateToLecture} />);

    await fireEvent.press(screen.getByText("Library Lecture"));

    expect(onNavigateToLecture).toHaveBeenCalledWith("lecture-1");
  });
});
