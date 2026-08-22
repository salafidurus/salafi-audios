import { useListingDetail, useListingContents, useLastPlayedLesson } from "@sd/domain-content";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "bun:test";

import { ListingDetailScreen } from "./listing-detail.screen";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@sd/domain-content", () => ({
  useListingDetail: vi.fn(),
  useListingContents: vi.fn(),
  useLastPlayedLesson: vi.fn(),
  useIsSaved: vi.fn().mockReturnValue(false),
  markSaved: vi.fn(),
  markUnsaved: vi.fn(),
}));

vi.mock("@/core/auth", () => ({
  useAuth: vi.fn().mockReturnValue({ isAuthenticated: false, user: null }),
}));

vi.mock("@sd/domain-audio", () => ({
  useAudio: vi.fn().mockReturnValue({ isPlaying: false, currentTrack: null }),
  useProgressStore: vi.fn((selector) =>
    selector({ progressMap: {}, actions: { isSaved: () => false } }),
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
  window.location.hash = "";
});

afterEach(() => {
  cleanup();
});

describe("ListingDetailScreen", () => {
  it("shows loading state when detail is fetching", () => {
    mockUseListingDetail.mockReturnValue({ data: undefined, isFetching: true });
    render(<ListingDetailScreen slug="tawheed-lecture" />);
    expect(screen.getByText("Back")).toBeTruthy();
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
    expect(screen.getAllByText("Ibn Baz").length).toBeGreaterThan(0);
    expect(screen.getByRole("navigation", { name: "Breadcrumbs" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
    expect(screen.getByRole("region", { name: "Listen now" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Listen now" })).toBeTruthy();
    expect(screen.getAllByText("Play").length).toBeGreaterThan(0);
  });

  it("renders normally when the resolved listing is already top-level", () => {
    mockUseListingDetail.mockReturnValue({ data: mockSingleListing, isFetching: false });
    mockUseListingContents.mockReturnValue({ data: mockSingleContents, isFetching: false });

    render(<ListingDetailScreen slug="tawheed-lecture" />);
    expect(screen.getAllByText("Kitab At-Tawheed Lecture").length).toBeGreaterThan(0);
  });

  it("summarizes collection modules rather than nested lessons", () => {
    mockUseListingDetail.mockReturnValue({
      data: { ...mockSingleListing, format: "collection" },
      isFetching: false,
    });
    mockUseListingContents.mockReturnValue({
      data: {
        format: "collection",
        modules: [
          { id: "m1", title: "Module One", lessons: [] },
          { id: "m2", title: "Module Two", lessons: [] },
        ],
      },
      isFetching: false,
    });

    render(<ListingDetailScreen slug="collection" />);

    expect(screen.getByRole("heading", { name: "Modules" })).toBeTruthy();
    expect(screen.getByText("2 items")).toBeTruthy();
  });

  it("shows a loading guard instead of the wrong content when the resolved listing is nested", () => {
    // The server-rendered page (app/.../listings/[slug]/page.tsx) redirects a
    // nested Lesson/Module's slug before this screen ever mounts with real
    // data; this only covers the defensive fallback if that's ever bypassed.
    mockUseListingDetail.mockReturnValue({
      data: {
        ...mockSingleListing,
        id: "lesson-1",
        rootListing: { id: "series-1", slug: "explanation-of-tawheed", title: "Explanation" },
      },
      isFetching: false,
    });

    render(<ListingDetailScreen slug="tawheed-lecture" />);

    expect(screen.getByText("Loading content…")).toBeTruthy();
    expect(screen.queryByText("Kitab At-Tawheed Lecture")).toBeNull();
  });
});
