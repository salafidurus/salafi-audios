import React from "react";
import renderer, { act } from "react-test-renderer";
import type { LibraryItemDto } from "@sd/core-contracts";
import {
  useLibraryCompletedScreen,
  useLibraryProgressScreen,
  useLibrarySavedScreen,
} from "@sd/domain-content";
import { useAuth } from "../../../core/auth/use-auth";
import { LibraryScreen } from "./library.screen";

jest.mock("@sd/domain-content", () => ({
  useLibraryCompletedScreen: jest.fn(),
  useLibraryProgressScreen: jest.fn(),
  useLibrarySavedScreen: jest.fn(),
}));

jest.mock("../../../core/auth/use-auth", () => ({
  useAuth: jest.fn(),
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

    expect(JSON.stringify(tree!.toJSON())).toContain("Loading your library...");
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
