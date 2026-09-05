import { useScholarPageFeeds } from "@sd/domain-content";
import { render } from "@testing-library/react-native";
import React from "react";

import { ExploreScholarScreen } from "./explore-scholar.screen";

jest.mock("@sd/domain-content", () => ({
  useScholarPageFeeds: jest.fn(),
}));
jest.mock("@sd/core-i18n", () => ({
  getEmptyStateText: () => "No scholars available.",
  getErrorStateText: () => "Failed to load scholars.",
}));
jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
    i18n: { language: "en" },
  }),
}));
jest.mock("@/features/navigation", () => ({
  RootScreenHeader: ({ title }: { title: string }) => {
    const { Text } = require("react-native");
    return <Text>{title}</Text>;
  },
}));
jest.mock("@/shared/ui", () => ({
  AppText: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require("react-native");
    return <Text>{children}</Text>;
  },
  ScreenView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/features/listing/components/scholar-row/scholar-row", () => ({
  ScholarRow: ({ scholar }: { scholar: { name: string } }) => {
    const { Text } = require("react-native");
    return <Text>{scholar.name}</Text>;
  },
}));
jest.mock("@/features/listing/components/scholar-content-list/scholar-content-list", () => ({
  ScholarContentList: ({ items }: { items: Array<{ title: string }> }) => {
    const { Text, View } = require("react-native");
    return (
      <View>
        {items.map((item) => (
          <Text key={item.title}>{item.title}</Text>
        ))}
      </View>
    );
  },
}));
jest.mock("../components/explore-skeleton/explore-skeleton", () => ({
  ExploreSkeleton: () => null,
}));
jest.mock("../components/explore-status/explore-status", () => ({
  ExploreLoadingFooter: () => null,
  ExploreStatusView: () => null,
}));

const mockUseScholarPageFeeds = jest.mocked(useScholarPageFeeds);

describe("ExploreScholarScreen", () => {
  it("renders scholar listings batches in API order", async () => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: {
        schemaVersion: 1,
        exhausted: true,
        batches: [
          {
            form: "scholars",
            id: "scholars:allamah",
            title: { kind: "allamah", id: "allamah_scholars", label: "Allamah scholars" },
            items: [{ id: "s1", slug: "ibn-baz", name: "Ibn Baz", lectureCount: 2 }],
          },
          {
            form: "scholar_listings",
            id: "scholar-listings:ibn-baz",
            scholarSlug: "ibn-baz",
            title: { kind: "scholar_listings", id: "scholar_listings", label: "Ibn Baz listings" },
            scholar: { id: "s1", slug: "ibn-baz", name: "Ibn Baz", lectureCount: 2 },
            items: [
              {
                id: "l1",
                slug: "first",
                title: "First listing",
                type: "single",
                recencyAt: "2026",
              },
              {
                id: "l2",
                slug: "second",
                title: "Second listing",
                type: "series",
                recencyAt: "2025",
              },
            ],
          },
        ],
      },
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    const result = await render(<ExploreScholarScreen />);

    expect(result.getByText("Ibn Baz listings")).toBeTruthy();
    expect(result.getByText("First listing")).toBeTruthy();
    expect(result.getByText("Second listing")).toBeTruthy();
  });

  it("renders topic scholars batches from the hydrated response", async () => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: {
        schemaVersion: 1,
        exhausted: true,
        batches: [
          {
            form: "topic_scholars",
            id: "topic-scholars:aqeedah",
            topicSlug: "aqeedah",
            title: { kind: "topic_scholars", id: "topic_scholars", label: "Aqeedah scholars" },
            topic: { id: "topic-1", slug: "aqeedah", name: "Aqeedah" },
            items: [{ id: "s1", slug: "ibn-baz", name: "Ibn Baz", lectureCount: 2 }],
          },
        ],
      },
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    const result = await render(<ExploreScholarScreen />);

    expect(result.getByText("Aqeedah scholars")).toBeTruthy();
    expect(result.getByText("Aqeedah")).toBeTruthy();
    expect(result.getByText("Ibn Baz")).toBeTruthy();
  });

  it("ignores unknown future batches while rendering supported batches", async () => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: {
        schemaVersion: 1,
        exhausted: true,
        batches: [
          {
            form: "future_form",
            id: "future:1",
            title: { kind: "future", id: "future", label: "Future" },
            items: [],
          },
          {
            form: "scholars",
            id: "scholars:allamah",
            title: { kind: "allamah", id: "allamah_scholars", label: "Allamah scholars" },
            items: [{ id: "s1", slug: "ibn-baz", name: "Ibn Baz", lectureCount: 2 }],
          },
        ],
      },
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    const result = await render(<ExploreScholarScreen />);

    expect(result.getByText("Ibn Baz")).toBeTruthy();
    expect(result.queryByText("Future")).toBeNull();
  });
});
