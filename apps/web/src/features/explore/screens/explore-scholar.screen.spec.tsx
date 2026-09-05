import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "bun:test";
import React from "react";

import { ExploreScholarScreen } from "./explore-scholar.screen";

const mockUseScholarPageFeeds = vi.fn();

vi.mock("@sd/domain-content", () => ({
  useScholarPageFeeds: mockUseScholarPageFeeds,
}));
vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal,
    i18n: { language: "en" },
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/shared/components/ScrollToTopButton", () => ({
  ScrollToTopButton: () => <div data-testid="scroll-to-top" />,
}));
vi.mock("@/shared/utils/format-scholar-name", () => ({
  useFormatScholarName: () => (scholar: { name: string }) => scholar.name,
}));
vi.mock("../components/scholar-grid-skeleton/scholar-grid-skeleton", () => ({
  ScholarGridSkeleton: () => <div data-testid="scholar-grid-skeleton" />,
}));
vi.mock("@/features/details/components/scholar/scholar-content-list/scholar-content-list", () => ({
  ContentRow: ({ item }: { item: { title: string } }) => <div>{item.title}</div>,
}));

describe("ExploreScholarScreen", () => {
  const scholars = [
    {
      id: "scholar-1",
      slug: "ibn-baz",
      name: "Ibn Baz",
      mainLanguage: "en" as const,
      lectureCount: 12,
    },
    {
      id: "scholar-2",
      slug: "al-albani",
      name: "Al Albani",
      mainLanguage: "ar" as const,
      lectureCount: 0,
    },
  ];

  beforeEach(() => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: undefined,
      isFetching: false,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("renders the scholars screen with title", () => {
    render(<ExploreScholarScreen />);

    expect(screen.getByText("Scholars")).toBeTruthy();
  });

  it("renders skeleton when loading and no scholars", () => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: undefined,
      isFetching: true,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    expect(screen.getByTestId("scholar-grid-skeleton")).toBeTruthy();
  });

  it("renders empty state when no scholars and not loading", () => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: { batches: [], schemaVersion: 1, exhausted: true },
      isFetching: false,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    expect(screen.getByText("No scholars available.")).toBeTruthy();
  });

  it("renders scholars in the supplied page-feed order", () => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: {
        batches: [
          {
            form: "scholars",
            id: "scholars:allamah",
            title: { kind: "allamah", id: "allamah_scholars", label: "Allamah scholars" },
            items: scholars,
          },
        ],
        schemaVersion: 1,
        exhausted: true,
      },
      isFetching: false,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    expect(screen.getByRole("button", { name: /ibn baz/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /al albani/i })).toBeTruthy();

    expect(screen.getByRole("button", { name: /ibn baz/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /al albani/i })).toBeTruthy();
  });

  it("renders an error retry action when the initial request fails", () => {
    const refetch = vi.fn();
    mockUseScholarPageFeeds.mockReturnValue({
      data: undefined,
      isFetching: false,
      isLoading: false,
      isError: true,
      refetch,
    });

    render(<ExploreScholarScreen />);

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("does not render a load-more control", () => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: {
        batches: [
          {
            form: "scholars",
            id: "scholars:allamah",
            title: { kind: "allamah", id: "allamah_scholars", label: "Allamah scholars" },
            items: scholars,
          },
        ],
        schemaVersion: 1,
        exhausted: true,
      },
      isFetching: false,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    expect(screen.queryByRole("button", { name: /load more/i })).toBeNull();
  });

  it("renders scholar listings batches in the supplied order", () => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: {
        batches: [
          {
            form: "scholar_listings",
            id: "scholar-listings:ibn-baz",
            scholarSlug: "ibn-baz",
            title: { kind: "scholar_listings", id: "scholar_listings", label: "Ibn Baz listings" },
            scholar: scholars[0],
            items: [
              {
                id: "listing-1",
                slug: "first",
                title: "First listing",
                type: "single",
                recencyAt: "2026-01-01T00:00:00.000Z",
              },
              {
                id: "listing-2",
                slug: "second",
                title: "Second listing",
                type: "series",
                recencyAt: "2025-01-01T00:00:00.000Z",
              },
            ],
          },
        ],
        schemaVersion: 1,
        exhausted: true,
      },
      isFetching: false,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    expect(screen.getByText("Ibn Baz listings")).toBeTruthy();
    expect(screen.getByText("First listing")).toBeTruthy();
    expect(screen.getByText("Second listing")).toBeTruthy();
  });

  it("renders topic scholars batches without fetching topic data separately", () => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: {
        batches: [
          {
            form: "topic_scholars",
            id: "topic-scholars:aqeedah",
            topicSlug: "aqeedah",
            title: { kind: "topic_scholars", id: "topic_scholars", label: "Aqeedah scholars" },
            topic: { id: "topic-1", slug: "aqeedah", name: "Aqeedah" },
            items: [scholars[0]],
          },
        ],
        schemaVersion: 1,
        exhausted: true,
      },
      isFetching: false,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    expect(screen.getByText("Aqeedah scholars")).toBeTruthy();
    expect(screen.getByText("Aqeedah")).toBeTruthy();
    expect(screen.getAllByText("Ibn Baz").length).toBeGreaterThan(0);
  });

  it("ignores unknown future batches while rendering supported batches", () => {
    mockUseScholarPageFeeds.mockReturnValue({
      data: {
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
            items: [scholars[0]],
          },
        ],
        schemaVersion: 1,
        exhausted: true,
      },
      isFetching: false,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    expect(screen.getByRole("button", { name: /ibn baz/i })).toBeTruthy();
    expect(screen.queryByText("Future")).toBeNull();
  });
});
