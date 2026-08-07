import { useScholarContent, useScholarDetail } from "@sd/domain-content";
import { render, screen } from "@testing-library/react-native";
import React from "react";

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

jest.mock("@/features/listing/components/scholar-header/scholar-header", () => ({
  ScholarHeader: ({ scholar }: { scholar: { name: string } }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactM = require("react");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return ReactM.createElement(Text, null, `Header:${scholar.name}`);
  },
}));

jest.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: jest.fn(() => false),
}));

jest.mock("@/shared/hooks/use-listing-navigation", () => ({
  useListingNavigation: jest.fn(() => ({ navigateToListing: jest.fn() })),
}));

const mockedUseScholarDetail = jest.mocked(useScholarDetail) as any;
const mockedUseScholarContent = jest.mocked(useScholarContent) as any;

const baseScholar = {
  id: "scholar-1",
  slug: "ibn-baz",
  name: "Ibn Baz",
  bio: undefined,
  imageUrl: undefined,
  country: undefined,
  mainLanguage: undefined,
  isActive: true,
  socialTelegram: undefined,
  socialTwitter: undefined,
  socialWebsite: undefined,
  socialYoutube: undefined,
  createdAt: "2026-04-11T00:00:00.000Z",
  lectureCount: 12,
  seriesCount: 3,
  totalDurationSeconds: 3600,
};

const singleItem = {
  id: "lecture-1",
  slug: "lecture",
  title: "A Lecture",
  type: "single" as const,
  recencyAt: "2024-01-01T00:00:00Z",
  durationSeconds: 1800,
};

const seriesItem = {
  id: "series-1",
  slug: "series",
  title: "A Series",
  type: "series" as const,
  recencyAt: "2024-01-01T00:00:00Z",
  lectureCount: 5,
  durationSeconds: 9000,
};

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

  it("renders the scholar header and flat content list when data exists", async () => {
    mockedUseScholarDetail.mockReturnValue({ data: baseScholar, isFetching: false });
    mockedUseScholarContent.mockReturnValue({
      data: { items: [singleItem, seriesItem] },
      isFetching: false,
    });

    await render(<ScholarDetailScreen slug="ibn-baz" />);

    expect(screen.getByText("Header:Ibn Baz")).toBeTruthy();
    expect(screen.getByText("SERIES")).toBeTruthy();
    expect(screen.getByText("A Lecture")).toBeTruthy();
    expect(screen.getByText("A Series")).toBeTruthy();
    // Series rows show "N lectures" subtitle
    expect(screen.getByText("5 lectures")).toBeTruthy();
  }, 15000);

  it("renders an empty state when there is no published content", async () => {
    mockedUseScholarDetail.mockReturnValue({ data: baseScholar, isFetching: false });
    mockedUseScholarContent.mockReturnValue({
      data: { items: [] },
      isFetching: false,
    });

    await render(<ScholarDetailScreen slug="ibn-baz" />);

    expect(screen.getByText("No published content yet.")).toBeTruthy();
  });
});
