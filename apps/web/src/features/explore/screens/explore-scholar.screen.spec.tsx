import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "bun:test";
import React from "react";

import { ExploreScholarScreen } from "./explore-scholar.screen";

const mockUseInfiniteScholarsList = vi.fn();

vi.mock("@sd/domain-content", () => ({
  useInfiniteScholarsList: mockUseInfiniteScholarsList,
}));
vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal: string) => defaultVal,
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/shared/components/Search", () => ({
  Search: {
    Bar: ({
      placeholder,
      value,
      onChange,
    }: {
      placeholder?: string;
      value: string;
      onChange: (value: string) => void;
    }) => (
      <input
        data-testid="search-bar"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    ),
  },
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
    mockUseInfiniteScholarsList.mockReturnValue({
      data: { pages: [] },
      isFetching: false,
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it("renders the scholars screen with title", () => {
    render(<ExploreScholarScreen />);

    expect(screen.getByText("Scholars")).toBeTruthy();
  });

  it("renders search bar", () => {
    render(<ExploreScholarScreen />);

    const searchInput = screen.getByPlaceholderText(/search scholars/i);
    expect(searchInput).toBeTruthy();
  });

  it("renders skeleton when loading and no scholars", () => {
    mockUseInfiniteScholarsList.mockReturnValue({
      data: undefined,
      isFetching: true,
      isLoading: true,
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    expect(screen.getByTestId("scholar-grid-skeleton")).toBeTruthy();
  });

  it("renders empty state when no scholars and not loading", () => {
    mockUseInfiniteScholarsList.mockReturnValue({
      data: { pages: [] },
      isFetching: false,
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    expect(screen.getByText("No scholars available.")).toBeTruthy();
  });

  it("renders aligned scholar results and filters by name or slug", async () => {
    mockUseInfiniteScholarsList.mockReturnValue({
      data: { pages: [{ items: scholars }] },
      isFetching: false,
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    expect(screen.getByRole("button", { name: /ibn baz/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /al albani/i })).toBeTruthy();

    fireEvent.change(screen.getByTestId("search-bar"), { target: { value: "ibn-baz" } });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    expect(screen.getByRole("button", { name: /ibn baz/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /al albani/i })).toBeNull();
  });

  it("renders an error retry action when the initial request fails", () => {
    const refetch = vi.fn();
    mockUseInfiniteScholarsList.mockReturnValue({
      data: { pages: [] },
      isFetching: false,
      isLoading: false,
      isError: true,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      refetch,
    });

    render(<ExploreScholarScreen />);

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders and invokes load more when another page is available", () => {
    const fetchNextPage = vi.fn();
    mockUseInfiniteScholarsList.mockReturnValue({
      data: { pages: [{ items: scholars }] },
      isFetching: false,
      isLoading: false,
      isError: false,
      hasNextPage: true,
      fetchNextPage,
      refetch: vi.fn(),
    });

    render(<ExploreScholarScreen />);

    fireEvent.click(screen.getByRole("button", { name: /load more/i }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
