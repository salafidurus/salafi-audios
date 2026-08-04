import { routes } from "@sd/core-contracts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { SearchProcessingScreen } from "./search-processing.screen";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/shared/hooks/use-responsive", () => ({
  useIsDesktop: () => true,
  useResponsive: () => ({ isMobile: false }),
}));

vi.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: () => false,
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock("@/shared/components/InfiniteScrollList", () => ({
  InfiniteScrollList: (props: any) => {
    const mockItems = [
      {
        id: "series-123",
        slug: "test-series",
        title: "Test Series",
        scholarName: "Ibn Uthaymeen",
        lectureCount: 10,
        durationSeconds: 3600,
      },
    ];

    return (
      <div data-testid="infinite-scroll-list">
        {mockItems.map((item: any) => (
          <div key={item.id} onClick={() => props.renderItem?.(item)}>
            {props.renderItem?.(item) ?? item.title}
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock("@/features/search/components/SearchResultItem/SearchResultItem", () => ({
  SearchResultItem: ({ item, onPress }: { item: any; onPress?: () => void }) => (
    <div data-testid="search-result-item" onClick={onPress}>
      {item.title}
    </div>
  ),
}));

vi.mock("@/shared/components/Search", () => ({
  Search: {
    Bar: ({ placeholder }: { placeholder?: string }) => (
      <div data-testid="search-bar" data-placeholder={placeholder} />
    ),
    Filter: ({ selected, chips, onChipChange }: any) => (
      <div data-testid="search-filter" data-selected={JSON.stringify(selected)}>
        {chips.map((chip: any) => (
          <button key={chip.id} data-chip-id={chip.id} onClick={() => onChipChange?.(chip.id)}>
            {chip.label}
          </button>
        ))}
      </div>
    ),
  },
}));

vi.mock("@sd/domain-search", () => ({
  useTopicsList: () => ({
    data: [
      { id: "t1", slug: "fiqh", name: { ar: "فقه", en: "Fiqh" } },
      { id: "t2", slug: "aqeedah", name: { ar: "عقيدة", en: "Aqeedah" } },
    ],
  }),
  useInfiniteSearch: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  })),
}));

describe("SearchProcessingScreen", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it("navigates to series detail on series item click (desktop)", () => {
    renderWithProviders(<SearchProcessingScreen searchKey="jurisprudence" />);

    // Click the search result item
    const item = screen.getByText("Test Series");
    fireEvent.click(item);

    expect(mockPush).toHaveBeenCalledWith(routes.listings.detail("test-series"));
  });

  it("navigates to series detail on series item click (mobile)", () => {
    renderWithProviders(<SearchProcessingScreen searchKey="jurisprudence" />);

    // Click the search result item
    const item = screen.getByText("Test Series");
    fireEvent.click(item);

    expect(mockPush).toHaveBeenCalledWith(routes.listings.detail("test-series"));
  });

  it("seeds the topic filter from the topicSlug prop", () => {
    renderWithProviders(<SearchProcessingScreen topicSlug="fiqh" />);

    const filter = screen.getByTestId("search-filter");
    expect(filter.getAttribute("data-selected")).toBe('["fiqh"]');
  });

  it("toggles a topic chip in the filter", () => {
    renderWithProviders(<SearchProcessingScreen />);

    fireEvent.click(screen.getByText("Fiqh"));

    const filter = screen.getByTestId("search-filter");
    expect(filter.getAttribute("data-selected")).toBe('["fiqh"]');
  });
});
