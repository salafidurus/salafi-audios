import { useHomeRecent, useHomePromotions, useScholarsList } from "@sd/domain-content";
import { useContinueListening } from "@sd/domain-search";
import { render, screen, fireEvent, within } from "@testing-library/react-native";

import { useAuth } from "@/core/auth/use-auth";

import { resolveHomeAvatarImage } from "../utils/home-artwork";
import { HomeScreen } from "./home.screen";

jest.mock("@sd/domain-audio", () => ({
  useProgressStore: jest.fn((selector: (state: unknown) => unknown) =>
    selector({ progressMap: {} }),
  ),
}));
jest.mock("@sd/domain-search", () => ({ useContinueListening: jest.fn() }));
jest.mock("@sd/domain-content", () => ({
  formatScholarName: (scholar: string | { name: string; title?: string }, title?: string) => {
    const name = typeof scholar === "string" ? scholar : scholar.name;
    const scholarTitle = typeof scholar === "string" ? title : scholar.title;
    return scholarTitle ? `${scholarTitle} ${name}` : name;
  },
  useHomeRecent: jest.fn(),
  useHomePromotions: jest.fn(),
  useScholarsList: jest.fn(),
}));
jest.mock("@/core/auth/use-auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    i18n: { language: "en" },
  }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockedAuth = jest.mocked(useAuth);
const mockedContinue = jest.mocked(useContinueListening);
const mockedExplore = jest.mocked(useHomeRecent);
const mockedScholars = jest.mocked(useScholarsList);
const mockedPromotions = jest.mocked(useHomePromotions);

const item = {
  kind: "series" as const,
  id: "listing-1",
  title: "A lesson in patience",
  slug: "patience",
  scholarName: "Scholar",
  scholarSlug: "scholar",
  thumbnailUrl: null,
  durationSeconds: 600,
  publishedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  mockedAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, user: undefined });
  mockedContinue.mockReturnValue({ recentProgress: null, data: null, isLoading: false } as never);
  mockedExplore.mockReturnValue({
    data: {
      pages: [
        {
          batches: [
            {
              kind: "listings",
              id: "listings:recent",
              title: { kind: "listings", id: "recent", label: "Continue exploring" },
              reason: "deterministic_recent",
              items: [item],
            },
          ],
          exhausted: true,
        },
      ],
    },
    isLoading: false,
    isError: false,
  } as never);
  mockedScholars.mockReturnValue({
    data: { scholars: [{ id: "scholar-1", slug: "scholar", name: "Scholar" }] },
    isLoading: false,
  } as never);
  mockedPromotions.mockReturnValue({
    data: {
      hero: { id: "hero-1", listingId: item.id, headline: "Featured", listing: item },
      editorsPicks: [],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  } as never);
});

describe("HomeScreen", () => {
  it("resolves listing artwork before scholar artwork and leaves initials to UserAvatar", () => {
    expect(resolveHomeAvatarImage("listing.jpg", "scholar.jpg")).toBe("listing.jpg");
    expect(resolveHomeAvatarImage(null, "scholar.jpg")).toBe("scholar.jpg");
    expect(resolveHomeAvatarImage("  ", "")).toBeUndefined();
  });

  it("renders discovery, scholars, recent, curated, and mobile continuity sections", async () => {
    await render(<HomeScreen />);

    expect(screen.getByTestId("home-discovery-section")).toBeTruthy();
    expect(screen.getByTestId("home-scholars-section")).toBeTruthy();
    expect(screen.getByTestId("home-recent-section")).toBeTruthy();
    expect(screen.getByTestId("home-curated-section")).toBeTruthy();
    expect(screen.queryByTestId("home-continue-listening")).toBeNull();
  });

  it("requests Continue Listening only after authentication resolves", async () => {
    await render(<HomeScreen />);
    expect(mockedContinue).toHaveBeenCalledWith({ enabled: false });

    mockedAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: undefined });
    await render(<HomeScreen />);
    expect(mockedContinue).toHaveBeenLastCalledWith({ enabled: true });
  });

  it("shows unfinished progress and sends its lecture slug to navigation", async () => {
    const onNavigateToListing = jest.fn();
    mockedAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: undefined });
    mockedContinue.mockReturnValue({
      recentProgress: {
        lectureTitle: "Resume this lesson",
        lectureSlug: "resume-lesson",
        listingSlug: "resume-listing",
        format: "series",
        scholarName: "Scholar",
        scholarSlug: "scholar",
        durationSeconds: 100,
        positionSeconds: 25,
      },
      data: null,
      isLoading: false,
    } as never);

    await render(<HomeScreen onNavigateToListing={onNavigateToListing} />);
    await fireEvent.press(screen.getByTestId("home-resume-listening"));

    expect(onNavigateToListing).toHaveBeenCalledWith("resume-lesson");
  });

  it("uses the featured section title and three-line continue listening hierarchy", async () => {
    mockedAuth.mockReturnValue({ isAuthenticated: true, isLoading: false, user: undefined });
    mockedContinue.mockReturnValue({
      recentProgress: {
        lectureTitle: "Resume this lesson",
        lectureSlug: "resume-lesson",
        listingSlug: "resume-listing",
        format: "series",
        scholarName: "Scholar",
        scholarSlug: "scholar",
        durationSeconds: 100,
        positionSeconds: 25,
      },
      data: null,
      isLoading: false,
    } as never);

    await render(<HomeScreen />);

    expect(screen.getByText("FEATURED FOR STUDY")).toBeTruthy();
    expect(screen.getByText("Resume this lesson")).toBeTruthy();
    expect(within(screen.getByTestId("home-resume-listening")).getByText("Scholar")).toBeTruthy();
    expect(screen.getByText("25% listened")).toBeTruthy();
    expect(screen.queryByText("PICK UP WHERE YOU LEFT OFF")).toBeNull();
  });

  it("renders a recoverable error when no public Home content is available", async () => {
    mockedExplore.mockReturnValue({ data: undefined, isLoading: false, isError: false } as never);
    mockedPromotions.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    } as never);

    await render(<HomeScreen />);
    expect(screen.getByText("Home could not be loaded.")).toBeTruthy();
  });
});
