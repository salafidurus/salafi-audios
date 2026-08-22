import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "bun:test";
import React from "react";

import { DEFAULT_EXPLORE_FILTERS } from "../utils/explore-filters";
import { FeedRecentScreen } from "./explore-recent.screen";

const mockUseExploreRecentScreen = vi.fn();
const mockUseInfiniteSearch = vi.fn();
const mockUseScholarsList = vi.fn();
const mockUseTopicsList = vi.fn();
const mockUseAuth = vi.fn();
const mockUseExploreFilters = vi.fn();

vi.mock("@sd/domain-content", () => ({
  useExploreRecentScreen: mockUseExploreRecentScreen,
  useScholarsList: mockUseScholarsList,
}));
vi.mock("@sd/domain-search", () => ({
  useInfiniteSearch: mockUseInfiniteSearch,
  useTopicsList: mockUseTopicsList,
}));
vi.mock("@/core/auth", () => ({ useAuth: mockUseAuth }));
vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (_key: string, fallback: string) => fallback,
  }),
}));
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false, isTablet: false, isWeb: true }),
}));
vi.mock("@/shared/hooks/use-formatted-scholar-name", () => ({
  useFormattedScholarName: (name: string) => name,
}));
vi.mock("@/shared/hooks/use-listing-navigation", () => ({
  useListingNavigation: () => ({ navigateToListing: vi.fn() }),
}));
vi.mock("@/features/audio", () => ({
  audioService: { pause: vi.fn(), resume: vi.fn() },
  usePlayListing: () => ({ play: vi.fn() }),
}));
vi.mock("@sd/domain-audio", () => ({
  useAudio: () => ({ isPlaying: false, currentTrack: null }),
  useProgressStore: (selector: (state: { progressMap: Record<string, never> }) => unknown) =>
    selector({ progressMap: {} }),
}));
vi.mock("@/core/toast", () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/shared/components/PageHeader", () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
vi.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/shared/components/ScrollToTopButton", () => ({ ScrollToTopButton: () => null }));
vi.mock("@/shared/components/StickyHeaderLayout", () => {
  const Layout = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Layout.Header = ({ children }: { children: React.ReactNode }) => <header>{children}</header>;
  Layout.Content = ({ children }: { children: React.ReactNode }) => <section>{children}</section>;
  return { StickyHeaderLayout: Layout };
});
vi.mock("@/shared/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock("@/shared/components/Search", () => ({
  Search: {
    Bar: ({
      value,
      onChange,
      placeholder,
    }: {
      value: string;
      onChange: (value: string) => void;
      placeholder: string;
    }) => (
      <input
        aria-label="Catalog search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
  },
}));
vi.mock("../components/explore-filter-field/explore-filter-field", () => ({
  ExploreFilterField: ({ label }: { label: string }) => <span>{label}</span>,
}));
vi.mock("../components/feed-skeleton/feed-skeleton", () => ({
  FeedSkeleton: () => <div data-testid="feed-skeleton">Loading catalog</div>,
}));
vi.mock("../components/feed-scholar-row/feed-scholar-row", () => ({
  FeedScholarRow: () => <div data-testid="scholar-feed-row">Scholar discovery</div>,
}));
vi.mock("../components/feed-topic-row/feed-topic-row", () => ({
  FeedTopicRow: ({ topicName }: { topicName: string }) => (
    <div data-testid="topic-feed-row">{topicName}</div>
  ),
}));
vi.mock("../hooks/use-explore-filters", () => ({
  useExploreFilters: mockUseExploreFilters,
}));
vi.mock("@/features/home/components/lecture-card/lecture-card", () => ({
  LectureCard: ({ title }: { title: string }) => <article>{title}</article>,
}));

function filters(overrides: Partial<typeof DEFAULT_EXPLORE_FILTERS> = {}) {
  return { ...DEFAULT_EXPLORE_FILTERS, ...overrides };
}

function exploreHookValue(overrides: Record<string, unknown> = {}) {
  return {
    filters: filters(),
    query: "",
    debouncedQuery: "",
    isHydrated: true,
    setQuery: vi.fn(),
    updateFilter: vi.fn(),
    clearFilter: vi.fn(),
    clearAll: vi.fn(),
    ...overrides,
  };
}

let currentExploreFilters = exploreHookValue();

function setup() {
  mockUseAuth.mockReturnValue({ user: null });
  mockUseScholarsList.mockReturnValue({
    data: { scholars: [{ slug: "ibn-baz", name: "Ibn Baz" }] },
  });
  mockUseTopicsList.mockReturnValue({
    data: [{ slug: "aqeedah", name: { en: "Aqeedah", ar: "العقيدة" } }],
  });
  mockUseExploreRecentScreen.mockReturnValue({
    data: { pages: [{ items: [{ kind: "topic_row", topicName: "Aqeedah", items: [] }] }] },
    isFetching: false,
    isError: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    refetch: vi.fn(),
  });
  mockUseInfiniteSearch.mockReturnValue({
    data: { pages: [] },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  currentExploreFilters = exploreHookValue();
  mockUseExploreFilters.mockImplementation(() => currentExploreFilters);
}

describe("FeedRecentScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setup();
  });

  it("renders the default feed and the complete catalog filter surface", () => {
    render(<FeedRecentScreen />);

    expect(screen.getByRole("heading", { name: "Listings Catalog" })).toBeInTheDocument();
    expect(screen.getByTestId("topic-feed-row")).toHaveTextContent("Aqeedah");
    expect(document.querySelector("search")).toHaveAttribute("aria-label", "Active filters");
    expect(screen.getByText("Content type")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Sort")).toBeInTheDocument();
  });

  it("shows the persisted filter summary and filtered catalog results", () => {
    currentExploreFilters = exploreHookValue({
      filters: filters({ topic: "aqeedah", sort: "title-asc" }),
    });
    mockUseInfiniteSearch.mockReturnValue({
      data: {
        pages: [
          {
            items: [
              {
                id: "l1",
                title: "Aqeedah Primer",
                format: "series",
                scholarName: "Ibn Baz",
                scholarSlug: "ibn-baz",
                slug: "aqeedah-primer",
                imageUrl: null,
                lectureCount: 4,
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<FeedRecentScreen />);

    expect(screen.getByText(/Topic: Aqeedah/)).toBeInTheDocument();
    expect(screen.getByText(/Sort: Title A–Z/)).toBeInTheDocument();
    expect(screen.getByText("Aqeedah Primer")).toBeInTheDocument();
  });

  it("covers loading and empty result states", () => {
    currentExploreFilters = exploreHookValue({ isHydrated: false });
    const { rerender } = render(<FeedRecentScreen />);
    expect(screen.getByTestId("feed-skeleton")).toBeInTheDocument();

    currentExploreFilters = exploreHookValue({
      filters: filters({ language: "ar" }),
      isHydrated: true,
    });
    mockUseInfiniteSearch.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    rerender(<FeedRecentScreen />);
    expect(screen.getByText("No listings found matching your filters.")).toBeInTheDocument();
  });

  it("delegates Clear all to the persistent filter state", () => {
    const clearAll = vi.fn();
    currentExploreFilters = exploreHookValue({
      filters: filters({ format: "series" }),
      clearAll,
    });
    render(<FeedRecentScreen />);

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(clearAll).toHaveBeenCalledTimes(1);
  });
});
