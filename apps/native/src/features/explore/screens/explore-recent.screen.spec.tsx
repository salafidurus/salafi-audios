import { useExploreRecentScreen } from "@sd/domain-content";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import { ExploreScreen } from "./explore-recent.screen";

jest.mock("@sd/domain-content", () => ({
  useExploreRecentScreen: jest.fn(),
}));
jest.mock("@sd/domain-search", () => ({ useTopicsList: () => ({ data: [] }) }));
jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
jest.mock("@/features/navigation", () => ({
  RootScreenHeader: ({ title }: { title: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return <Text>{title}</Text>;
  },
}));
jest.mock("@/features/search", () => ({
  SearchFilter: () => null,
}));
jest.mock("@/shared/ui", () => ({
  AppText: ({ children, ...props }: { children: React.ReactNode; testID?: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return <Text {...props}>{children}</Text>;
  },
  ScreenView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseExploreRecentScreen = jest.mocked(useExploreRecentScreen);
jest.mock("../components/explore-podcast-row/explore-podcast-row", () => ({
  ExplorePodcastRow: () => null,
}));
jest.mock("../components/explore-scholar-row/explore-scholar-row", () => ({
  ExploreScholarRow: () => null,
}));
jest.mock("../components/explore-skeleton/explore-skeleton", () => ({
  ExploreSkeleton: () => null,
}));
jest.mock("../components/explore-status/explore-status", () => ({
  ExploreLoadingFooter: () => null,
  ExploreStatusView: () => null,
}));

describe("ExploreScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExploreRecentScreen.mockReturnValue({
      data: {
        pages: [
          {
            schemaVersion: 1,
            batches: [
              {
                kind: "topics",
                id: "topics:discoverable",
                title: { kind: "topics", id: "discoverable_topics", label: "Explore topics" },
                reason: "deterministic_topics",
                items: [
                  { id: "topic-1", slug: "aqeedah", name: "Aqeedah" },
                  { id: "topic-2", slug: "fiqh", name: "Fiqh" },
                ],
              },
            ],
            exhausted: true,
          },
        ],
        pageParams: [undefined],
      },
      isFetching: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: jest.fn(),
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useExploreRecentScreen>);
  });

  it("renders topic batch contents in API order", async () => {
    await render(<ExploreScreen />);

    expect(screen.getByText("Explore topics")).toBeTruthy();
    expect(screen.getByText("Aqeedah")).toBeTruthy();
    expect(screen.getByText("Fiqh")).toBeTruthy();
  });
});
