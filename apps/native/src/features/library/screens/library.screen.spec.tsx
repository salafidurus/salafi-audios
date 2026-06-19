import React from "react";
import renderer, { act } from "react-test-renderer";
import type { LibraryItemDto } from "@sd/core-contracts";
import {
  useLibraryCompletedScreen,
  useLibraryProgressScreen,
  useLibrarySavedScreen,
} from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { LibraryScreen } from "./library.screen";

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

  it("renders a loading state while all sections are fetching", () => {
    mockedUseLibraryProgressScreen.mockReturnValue(buildLibraryState([], true));
    mockedUseLibrarySavedScreen.mockReturnValue(buildLibraryState([], true));
    mockedUseLibraryCompletedScreen.mockReturnValue(buildLibraryState([], true));

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<LibraryScreen />);
    });

    expect(JSON.stringify(tree!.toJSON())).toContain("Loading My Library…");
  });

  it("renders empty section messages when no items exist", () => {
    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<LibraryScreen />);
    });

    const rendered = JSON.stringify(tree!.toJSON());

    expect(rendered).toContain("In Progress");
    expect(rendered).toContain("No lectures in progress.");
    expect(rendered).toContain("Saved");
    expect(rendered).toContain("No saved lectures yet.");
    expect(rendered).toContain("Completed");
    expect(rendered).toContain("No completed lectures yet.");
  });

  it("navigates to a lecture when an item is pressed", () => {
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

    let tree: ReturnType<typeof renderer.create>;

    act(() => {
      tree = renderer.create(<LibraryScreen onNavigateToLecture={onNavigateToLecture} />);
    });

    const touchables = tree!.root.findAll(
      (node: { props: { onPress?: unknown } }) => typeof node.props.onPress === "function",
    );
    act(() => {
      touchables[0].props.onPress();
    });

    expect(onNavigateToLecture).toHaveBeenCalledWith("lecture-1");
  });
});
