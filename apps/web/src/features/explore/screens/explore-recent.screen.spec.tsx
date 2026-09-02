import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "bun:test";
import React from "react";

import { DEFAULT_EXPLORE_FILTERS } from "../utils/explore-filters";
import { FeedRecentScreen } from "./explore-recent.screen";

const mockUseExploreRecentScreen = vi.fn();
const mockUseTopicsList = vi.fn();
const mockUseAuth = vi.fn();
const mockUseExploreFilters = vi.fn();

vi.mock("@sd/domain-content", () => ({ useExploreRecentScreen: mockUseExploreRecentScreen }));
vi.mock("@sd/domain-search", () => ({ useTopicsList: mockUseTopicsList }));
vi.mock("@/core/auth", () => ({ useAuth: mockUseAuth }));
vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    i18n: { language: "en" },
    t: (_key: string, fallback: string) => fallback,
  }),
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
vi.mock("../components/feed-skeleton/feed-skeleton", () => ({
  FeedSkeleton: () => <div data-testid="feed-skeleton">Loading discovery</div>,
}));
vi.mock("../components/feed-scholar-row/feed-scholar-row", () => ({
  FeedScholarRow: () => <div data-testid="scholar-feed-row">Scholar discovery</div>,
}));
vi.mock("../components/feed-topic-row/feed-topic-row", () => ({
  FeedTopicRow: ({ topicName }: { topicName: string }) => (
    <div data-testid="topic-feed-row">{topicName}</div>
  ),
}));
vi.mock("../hooks/use-explore-filters", () => ({ useExploreFilters: mockUseExploreFilters }));
vi.mock("@/features/home/components/lecture-card/lecture-card", () => ({
  LectureCard: ({ title }: { title: string }) => <article>{title}</article>,
}));

function filters(overrides: Partial<typeof DEFAULT_EXPLORE_FILTERS> = {}) {
  return { ...DEFAULT_EXPLORE_FILTERS, ...overrides };
}

function exploreHookValue(overrides: Record<string, unknown> = {}) {
  return {
    filters: filters(),
    isHydrated: true,
    updateFilter: vi.fn(),
    ...overrides,
  };
}

let currentExploreFilters = exploreHookValue();

function setup() {
  mockUseAuth.mockReturnValue({ user: null });
  mockUseTopicsList.mockReturnValue({
    data: [{ slug: "aqeedah", name: { en: "Aqeedah", ar: "العقيدة" } }],
  });
  mockUseExploreRecentScreen.mockReturnValue({
    data: {
      pages: [
        {
          items: [
            {
              kind: "single",
              id: "l1",
              slug: "lesson-1",
              title: "Lesson one",
              scholarName: "Ibn Baz",
              scholarSlug: "ibn-baz",
              thumbnailUrl: null,
              durationSeconds: 600,
              publishedAt: "2026-08-22",
            },
            {
              kind: "scholar_row",
              scholars: [{ id: "s1", slug: "ibn-baz", name: "Ibn Baz", imageUrl: null }],
            },
            { kind: "topic_row", topicName: "Aqeedah", items: [] },
          ],
          exhausted: false,
          nextCursor: "next",
        },
      ],
    },
    isFetching: false,
    isError: false,
    hasNextPage: true,
    fetchNextPage: vi.fn(),
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

  it("renders mixed discovery modules without a search box", () => {
    render(<FeedRecentScreen />);

    expect(screen.getByRole("heading", { name: "Explore" })).toBeInTheDocument();
    expect(screen.getByText("Lesson one")).toBeInTheDocument();
    expect(screen.getByTestId("scholar-feed-row")).toBeInTheDocument();
    expect(screen.getByTestId("topic-feed-row")).toHaveTextContent("Aqeedah");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("requests the selected Topic from the discovery API", () => {
    const updateFilter = vi.fn();
    currentExploreFilters = exploreHookValue({ updateFilter });
    render(<FeedRecentScreen />);

    expect(mockUseExploreRecentScreen).toHaveBeenCalledWith({
      topicSlug: undefined,
    });
    fireEvent.click(screen.getByRole("radio", { name: "Aqeedah" }));
    expect(updateFilter).toHaveBeenCalledWith("topic", "aqeedah");
  });

  it("renders the loading state before hydration", () => {
    currentExploreFilters = exploreHookValue({ isHydrated: false });
    render(<FeedRecentScreen />);
    expect(screen.getByTestId("feed-skeleton")).toBeInTheDocument();
  });
});
