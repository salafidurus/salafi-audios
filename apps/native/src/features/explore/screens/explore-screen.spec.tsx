import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { ExploreScreen } from "./explore-screen";

jest.mock("@sd/domain-content", () => ({
  useExploreRecentScreen: jest.fn(),
  useInfiniteScholarsList: jest.fn(),
}));

jest.mock("@sd/domain-search", () => ({
  useTopicsList: jest.fn(),
  useSearchCatalog: jest.fn(),
  buildSearchResultRows: jest.fn((data: unknown) => data ?? []),
}));

jest.mock("@/shared/components", () => {
  const ReactM = require("react");
  const { Text } = require("react-native");
  return {
    ScreenHeader: () => ReactM.createElement(Text, null, "ScreenHeader:Explore"),
    AppText: ({ children }: { children: React.ReactNode }) =>
      ReactM.createElement(Text, null, children),
  };
});

const { useExploreRecentScreen, useInfiniteScholarsList } = jest.requireMock("@sd/domain-content");
const { useTopicsList, useSearchCatalog } = jest.requireMock("@sd/domain-search");

const feedItem = {
  id: "recent-1",
  slug: "recent-1",
  kind: "content",
  title: "Recent Lecture",
  scholarName: "Shaykh X",
  publishedAt: "2026-01-01",
};

const scholarItem = {
  id: "scholar-1",
  slug: "scholar-1",
  name: "Ibn Baz",
  mainLanguage: "AR",
  lectureCount: 5,
};

const topic = { slug: "aqeedah", name: "Aqeedah", orderIndex: 1 };

const searchRow = {
  id: "row-1",
  slug: "row-1",
  title: "Aqeedah Lectures",
  scholarName: "Shaykh Y",
  format: "collection",
  lectureCount: 3,
};

const defaultFeed = {
  data: { pages: [{ items: [feedItem] }] },
  isFetching: false,
  isError: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
};

const defaultScholars = {
  data: { pages: [{ items: [scholarItem] }] },
  isFetching: false,
  isError: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
};

const defaultTopics = { data: [topic], isFetching: false, isError: false };

const defaultCatalog = {
  data: [searchRow],
  isFetching: false,
  isError: false,
  refetch: jest.fn(),
};

describe("ExploreScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useExploreRecentScreen.mockReturnValue(defaultFeed);
    useInfiniteScholarsList.mockReturnValue(defaultScholars);
    useTopicsList.mockReturnValue(defaultTopics);
    useSearchCatalog.mockReturnValue(defaultCatalog);
  });

  it("renders the Recent sub-tab by default", async () => {
    await render(<ExploreScreen />);

    expect(screen.getByTestId("explore-sub-tab-pills")).toBeTruthy();
    expect(screen.getByText("Recent Lecture")).toBeTruthy();
    expect(screen.queryByTestId("all-lectures-chip-all")).toBeNull();
  });

  it("switches between sub-tabs via the pills", async () => {
    await render(<ExploreScreen />);

    await fireEvent.press(screen.getByTestId("explore-pill-all"));
    expect(screen.getByTestId("all-lectures-chip-all")).toBeTruthy();
    expect(screen.getByText("Aqeedah Lectures")).toBeTruthy();

    await fireEvent.press(screen.getByTestId("explore-pill-scholars"));
    expect(screen.getByText("Ibn Baz")).toBeTruthy();

    await fireEvent.press(screen.getByTestId("explore-pill-curation"));
    expect(screen.getByText("Browse Scholars")).toBeTruthy();
  });

  it("pre-selects a topic chip when initialTopicSlug is provided", async () => {
    await render(<ExploreScreen initialSub="all" initialTopicSlug="aqeedah" />);

    const chip = screen.getByTestId("all-lectures-chip-aqeedah");
    expect(chip.props.accessibilityState).toEqual({ selected: true });
    const allChip = screen.getByTestId("all-lectures-chip-all");
    expect(allChip.props.accessibilityState).toEqual({ selected: false });
  });
});
