import { useListingDetail, useListingContents, useLastPlayedLesson } from "@sd/domain-content";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "bun:test";

import { ListingDetailScreen } from "./listing-detail.screen";

vi.mock("@sd/domain-content", () => ({
  useListingDetail: vi.fn(),
  useListingContents: vi.fn(),
  useLastPlayedLesson: vi.fn(),
  useToggleSaved: vi.fn().mockReturnValue({ mutate: vi.fn() }),
}));

const mockRouterReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

vi.mock("@/core/auth", () => ({
  useAuth: vi.fn().mockReturnValue({ isAuthenticated: false, user: null }),
}));

vi.mock("@sd/domain-audio", () => ({
  useAudio: vi.fn().mockReturnValue({ isPlaying: false, currentTrack: null }),
  useProgressStore: vi.fn((selector) =>
    selector({ progressMap: {}, savedMap: {}, actions: { isSaved: () => false } }),
  ),
}));

vi.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: vi.fn().mockReturnValue(false),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: vi.fn().mockReturnValue({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

const mockUseListingDetail = useListingDetail as any;
const mockUseListingContents = useListingContents as any;
const mockUseLastPlayedLesson = useLastPlayedLesson as any;

const mockSingleListing = {
  id: "l1",
  slug: "tawheed-lecture",
  title: "Kitab At-Tawheed Lecture",
  format: "single",
  scholar: { id: "s1", slug: "ibn-baz", name: "Ibn Baz" },
  topics: [{ id: "t1", slug: "aqeedah", name: "Aqeedah" }],
  durationSeconds: 1800,
};

const mockSingleContents = {
  format: "single",
  items: [
    {
      id: "l1",
      slug: "tawheed-lecture",
      title: "Kitab At-Tawheed Lecture",
      durationSeconds: 1800,
      primaryAudioAsset: { id: "a1", url: "https://example.com/audio.mp3" },
    },
  ],
};

beforeEach(() => {
  mockUseListingDetail.mockReturnValue({ data: undefined, isFetching: false });
  mockUseListingContents.mockReturnValue({ data: undefined, isFetching: false });
  mockUseLastPlayedLesson.mockReturnValue({ data: null, isFetching: false });
  mockRouterReplace.mockClear();
  window.location.hash = "";
});

afterEach(() => {
  cleanup();
});

describe("ListingDetailScreen", () => {
  it("shows loading state when detail is fetching", () => {
    mockUseListingDetail.mockReturnValue({ data: undefined, isFetching: true });
    render(<ListingDetailScreen slug="tawheed-lecture" />);
    expect(screen.getByText("Loading content…")).toBeTruthy();
  });

  it("shows not-found state when listing does not exist", () => {
    render(<ListingDetailScreen slug="missing" />);
    expect(screen.getByText("Content not found")).toBeTruthy();
  });

  it("renders single listing metadata and play button", () => {
    mockUseListingDetail.mockReturnValue({ data: mockSingleListing, isFetching: false });
    mockUseListingContents.mockReturnValue({ data: mockSingleContents, isFetching: false });

    render(<ListingDetailScreen slug="tawheed-lecture" />);
    expect(screen.getAllByText("Kitab At-Tawheed Lecture").length).toBeGreaterThan(0);
    expect(screen.getByText("Ibn Baz")).toBeTruthy();
    expect(screen.getAllByText("Play").length).toBeGreaterThan(0);
  });

  it("does not redirect when the resolved listing is already top-level", () => {
    mockUseListingDetail.mockReturnValue({ data: mockSingleListing, isFetching: false });
    mockUseListingContents.mockReturnValue({ data: mockSingleContents, isFetching: false });

    render(<ListingDetailScreen slug="tawheed-lecture" />);
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("redirects to the root listing, anchored to itself, when the resolved listing is nested", () => {
    mockUseListingDetail.mockReturnValue({
      data: {
        ...mockSingleListing,
        id: "lesson-1",
        rootListing: { id: "series-1", slug: "explanation-of-tawheed", title: "Explanation" },
      },
      isFetching: false,
    });

    render(<ListingDetailScreen slug="tawheed-lecture" />);

    expect(mockRouterReplace).toHaveBeenCalledWith("/listings/explanation-of-tawheed#lesson-1");
    expect(screen.getByText("Loading content…")).toBeTruthy();
    expect(screen.queryByText("Kitab At-Tawheed Lecture")).toBeNull();
  });
});
