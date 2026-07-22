import { describe, it, expect, beforeEach, vi } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ListingDetailScreen } from "./listing-detail.screen";
import { useListingDetail, useListingContents, useLastPlayedLesson } from "@sd/domain-content";

vi.mock("@sd/domain-content", () => ({
  useListingDetail: vi.fn(),
  useListingContents: vi.fn(),
  useLastPlayedLesson: vi.fn(),
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
});
