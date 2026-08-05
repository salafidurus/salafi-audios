import { render, screen } from "@testing-library/react";
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
    Bar: ({ placeholder }: { placeholder?: string }) => (
      <input data-testid="search-bar" placeholder={placeholder} />
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
});
