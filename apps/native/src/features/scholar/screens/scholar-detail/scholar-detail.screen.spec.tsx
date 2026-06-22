import React from "react";
import { render, screen } from "@testing-library/react-native";
import { useScholarDetail, useScholarContent } from "@sd/domain-content";
import { ScholarDetailScreen } from "./scholar-detail.screen";

jest.mock("@sd/domain-content", () => ({
  useScholarDetail: jest.fn(),
  useScholarContent: jest.fn(),
}));

jest.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require("react-native");
    return ReactM.createElement(View, null, children);
  },
}));

jest.mock("@/shared/components/AppText/AppText", () => ({
  AppText: ({ children }: { children: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, children);
  },
}));

jest.mock("@/features/scholar/components/scholar-header/scholar-header", () => ({
  ScholarHeader: ({ scholar }: { scholar: { name: string } }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Header:${scholar.name}`);
  },
}));

jest.mock("@/features/scholar/components/scholar-content-list/scholar-content-list", () => ({
  ScholarContentList: ({ content }: { content: { collections: unknown[] } }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Content:${content.collections.length}`);
  },
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedUseScholarDetail = jest.mocked(useScholarDetail) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedUseScholarContent = jest.mocked(useScholarContent) as any;

describe("ScholarDetailScreen", () => {
  it("renders a loading state while scholar detail is fetching", async () => {
    mockedUseScholarDetail.mockReturnValue({
      data: undefined,
      isFetching: true,
    });
    mockedUseScholarContent.mockReturnValue({
      data: undefined,
      isFetching: false,
    });

    await render(<ScholarDetailScreen slug="ibn-baz" />);

    expect(screen.getByText("Loading scholar…")).toBeTruthy();
  });

  it("renders an empty state when the scholar is missing", async () => {
    mockedUseScholarDetail.mockReturnValue({
      data: undefined,
      isFetching: false,
    });
    mockedUseScholarContent.mockReturnValue({
      data: undefined,
      isFetching: false,
    });

    await render(<ScholarDetailScreen slug="missing" />);

    expect(screen.getByText("Scholar not found")).toBeTruthy();
  });

  it("renders the scholar header and content when data exists", async () => {
    mockedUseScholarDetail.mockReturnValue({
      data: {
        id: "scholar-1",
        slug: "ibn-baz",
        name: "Ibn Baz",
        bio: undefined,
        imageUrl: undefined,
        country: undefined,
        mainLanguage: undefined,
        isActive: true,
        isKibar: true,
        socialTelegram: undefined,
        socialTwitter: undefined,
        socialWebsite: undefined,
        socialYoutube: undefined,
        createdAt: "2026-04-11T00:00:00.000Z",
        lectureCount: 12,
        seriesCount: 3,
        totalDurationSeconds: 3600,
      },
      isFetching: false,
    });
    mockedUseScholarContent.mockReturnValue({
      data: {
        collections: [
          { id: "collection-1", slug: "collection", title: "Collection", lectureCount: 2 },
        ],
        series: [],
        singles: [],
      },
      isFetching: false,
    });

    await render(<ScholarDetailScreen slug="ibn-baz" />);

    expect(screen.getByText("Header:Ibn Baz")).toBeTruthy();
    expect(screen.getByText("Content:1")).toBeTruthy();
  }, 15000);
});
