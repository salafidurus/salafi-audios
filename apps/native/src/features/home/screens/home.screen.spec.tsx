import { render, screen } from "@testing-library/react-native";
import React from "react";

import { HomeScreen } from "./home.screen";

jest.mock("@sd/domain-audio", () => ({
  usePlaybackStore: (selector: (state: unknown) => unknown) => selector({ currentTrack: null }),
}));

jest.mock("@sd/domain-content", () => ({
  useExploreRecentScreen: jest.fn(),
  useHomePromotions: jest.fn(),
  useInfiniteScholarsList: jest.fn(),
}));

jest.mock("@sd/domain-search", () => ({
  useContinueListening: jest.fn(),
  useSearchProcessing: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("lucide-react-native", () => {
  const ReactM = require("react");
  const { Text } = require("react-native");
  const Icon = () => ReactM.createElement(Text, null, "icon");
  return new Proxy({}, { get: () => Icon });
});

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("@/shared/components", () => {
  const ReactM = require("react");
  const { Text } = require("react-native");
  return {
    ScreenHeader: ({ title }: { title: string }) =>
      ReactM.createElement(Text, null, `ScreenHeader:${title}`),
    AppText: ({ children }: { children: React.ReactNode }) =>
      ReactM.createElement(Text, null, children),
  };
});

jest.mock("@/features/search/components/SearchFilter/SearchFilter", () => ({
  SearchFilter: () => null,
}));

jest.mock("@/features/search/components/SearchResultItem/SearchResultItem", () => ({
  SearchResultItem: () => null,
}));

jest.mock("@/features/search/components/SearchResultsList/SearchResultsList", () => ({
  SearchResultsList: () => null,
}));

jest.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: jest.fn(() => false),
}));

jest.mock("@/shared/hooks/use-listing-navigation", () => ({
  useListingNavigation: jest.fn(() => ({ navigateToListing: jest.fn() })),
}));

const { useExploreRecentScreen, useHomePromotions, useInfiniteScholarsList } =
  jest.requireMock("@sd/domain-content");
const { useContinueListening, useSearchProcessing } = jest.requireMock("@sd/domain-search");

const feedItem = {
  id: "recent-1",
  slug: "recent-1",
  kind: "listing",
  title: "Recent Lecture",
  scholarName: "Shaykh X",
  trackCount: 1,
};

const scholarItem = {
  id: "scholar-1",
  slug: "scholar-1",
  name: "Ibn Baz",
  initials: "B",
};

const searchState = {
  setQuery: jest.fn(),
  filter: "all",
  setFilter: jest.fn(),
  topics: [],
  items: [],
  isFetching: false,
  shouldSearch: false,
  errorMessage: undefined,
};

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSearchProcessing.mockReturnValue(searchState);
  });

  it("shows skeletons for every section while the initial home queries are loading", async () => {
    useContinueListening.mockReturnValue({ recentProgress: null, isLoading: true });
    useHomePromotions.mockReturnValue({ data: undefined, isLoading: true });
    useExploreRecentScreen.mockReturnValue({ data: undefined, isLoading: true });
    useInfiniteScholarsList.mockReturnValue({ data: undefined, isLoading: true });

    await render(<HomeScreen />);

    expect(screen.getByTestId("hero-skeleton")).toBeTruthy();
    expect(screen.getByTestId("scholar-medallions-rail-skeleton")).toBeTruthy();
    expect(screen.getByTestId("recently-added-skeleton")).toBeTruthy();
  });

  it("keeps sections on their skeleton until every home query has resolved", async () => {
    useContinueListening.mockReturnValue({ recentProgress: null, isLoading: false });
    useHomePromotions.mockReturnValue({ data: { hero: null, editorsPicks: [] }, isLoading: false });
    useExploreRecentScreen.mockReturnValue({
      data: { pages: [{ items: [feedItem] }] },
      isLoading: false,
    });
    useInfiniteScholarsList.mockReturnValue({ data: undefined, isLoading: true });

    await render(<HomeScreen />);

    expect(screen.getByTestId("scholar-medallions-rail-skeleton")).toBeTruthy();
    expect(screen.getByTestId("recently-added-skeleton")).toBeTruthy();
  });

  it("reveals the loaded sections together once all queries have resolved", async () => {
    useContinueListening.mockReturnValue({ recentProgress: null, isLoading: false });
    useHomePromotions.mockReturnValue({ data: { hero: null, editorsPicks: [] }, isLoading: false });
    useExploreRecentScreen.mockReturnValue({
      data: { pages: [{ items: [feedItem] }] },
      isLoading: false,
    });
    useInfiniteScholarsList.mockReturnValue({
      data: { pages: [{ items: [scholarItem] }] },
      isLoading: false,
    });

    await render(<HomeScreen />);

    expect(screen.getByTestId("scholar-medallions-rail")).toBeTruthy();
    expect(screen.getByTestId("recently-added-section")).toBeTruthy();
    expect(screen.queryByTestId("hero-skeleton")).toBeNull();
    expect(screen.queryByTestId("scholar-medallions-rail-skeleton")).toBeNull();
    expect(screen.queryByTestId("recently-added-skeleton")).toBeNull();
  });
});
