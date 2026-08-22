import { useExploreRecentScreen } from "@sd/domain-content";
import { useContinueListening } from "@sd/domain-search";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import React from "react";

import { useHomePromotions } from "../../hooks/use-home-promotions";
import { HomeScreen } from "./home.screen";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@sd/domain-search", () => ({
  useContinueListening: vi.fn(),
  useSearchCatalog: vi.fn(() => ({ data: undefined, isLoading: false })),
  useTopicsList: () => ({ data: [] }),
}));

vi.mock("@sd/domain-content", () => ({
  useInfiniteScholarsList: () => ({ data: undefined }),
  useExploreRecentScreen: vi.fn(),
}));

vi.mock("../../hooks/use-home-promotions", () => ({
  useHomePromotions: vi.fn(),
}));

describe("HomeScreen", () => {
  const mockOnContinueListening = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useContinueListening as unknown as Mock<any>).mockReturnValue({
      recentProgress: null,
      isLoading: false,
    });
    (useExploreRecentScreen as unknown as Mock<any>).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    (useHomePromotions as unknown as Mock<any>).mockReturnValue({
      data: { hero: null, editorsPicks: [] },
      isLoading: false,
    });
  });

  it("renders the hero header and subtitle without a search bar", () => {
    render(<HomeScreen onContinueListening={mockOnContinueListening} />);

    const heroTitle = screen.getByTestId("home-hero-title");
    expect(heroTitle).toBeTruthy();

    expect(screen.queryByText("What do you want to listen to?")).toBeNull();
  });

  it("renders continue listening section when recentProgress is provided", () => {
    (useContinueListening as unknown as Mock<any>).mockReturnValue({
      recentProgress: {
        lectureId: "lecture-123",
        lectureTitle: "Tauheed Explained",
        lectureSlug: "tauheed-explained",
        format: "single",
        orderIndex: 2,
        seriesContext: {
          seriesId: "series-123",
          seriesTitle: "Foundations of Tawheed",
          seriesSlug: "foundations-of-tawheed",
        },
        scholarName: "Shaikh Salih al-Fawzan",
        durationSeconds: 1800,
        positionSeconds: 600,
      },
      isLoading: false,
    });

    render(<HomeScreen onContinueListening={mockOnContinueListening} />);

    expect(screen.getByTestId("continue-listening-section")).toBeTruthy();

    const sectionTitle = screen.getByTestId("continue-listening-title");
    expect(sectionTitle.textContent).toBe("Continue Listening");

    const lectureTitle = screen.getByTestId("continue-listening-lecture-title");
    expect(lectureTitle.textContent).toBe("Tauheed Explained");

    expect(screen.getByTestId("continue-listening-context").textContent).toBe(
      "02 · Foundations of Tawheed",
    );

    const scholarName = screen.getByTestId("continue-listening-scholar-name");
    expect(scholarName.textContent).toBe("Shaikh Salih al-Fawzan");

    const progressText = screen.getByTestId("continue-listening-progress-text");
    expect(progressText.textContent).toBe("10:00");
    expect(screen.getByText("30:00")).toBeTruthy();
    expect(screen.getByText("33% complete")).toBeTruthy();
    expect(screen.getByText("Resume listening")).toBeTruthy();

    const card = screen.getByTestId("continue-listening-card");
    expect(card).toBeTruthy();
    fireEvent.click(card);

    expect(mockOnContinueListening).toHaveBeenCalledWith("tauheed-explained");
  });

  it("places listening continuity before discovery sections", () => {
    (useContinueListening as unknown as Mock<any>).mockReturnValue({
      recentProgress: {
        lectureId: "lecture-123",
        lectureTitle: "Tauheed Explained",
        lectureSlug: "tauheed-explained",
        scholarName: "Shaikh Salih al-Fawzan",
        durationSeconds: 1800,
        positionSeconds: 600,
      },
      isLoading: false,
    });

    render(<HomeScreen />);

    const landmarks = [
      screen.getByTestId("home-continue-listening-section"),
      screen.getByTestId("home-hero-section"),
      screen.getByTestId("home-category-section"),
      screen.getByTestId("home-scholars-section"),
      screen.getByTestId("home-recent-section"),
      screen.getByTestId("home-mobile-section"),
    ];

    for (let index = 1; index < landmarks.length; index += 1) {
      const previous = landmarks[index - 1];
      const current = landmarks[index];
      if (!previous || !current) {
        throw new Error("Expected every Home section landmark to be present");
      }
      expect(
        Boolean(previous.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING),
      ).toBe(true);
    }
  });

  it("renders module and collection context for a collection lesson", () => {
    (useContinueListening as unknown as Mock<any>).mockReturnValue({
      recentProgress: {
        lectureId: "lesson-123",
        lectureTitle: "The Meaning of Worship",
        lectureSlug: "the-meaning-of-worship",
        format: "single",
        scholarName: "Shaikh Salih al-Fawzan",
        scholarSlug: "salih-al-fawzan",
        durationSeconds: 1800,
        positionSeconds: 600,
        seriesContext: {
          seriesId: "module-123",
          seriesTitle: "Kitab al-Tawhid",
          seriesSlug: "kitab-al-tawhid",
        },
        rootListing: {
          id: "collection-123",
          title: "Foundations of Tawhid",
          slug: "foundations-of-tawhid",
        },
        rootFormat: "collection",
      },
      isLoading: false,
    });

    render(<HomeScreen />);

    const contextLines = screen.getAllByTestId("continue-listening-context");
    expect(contextLines.map((line) => line.textContent)).toEqual([
      "Kitab al-Tawhid",
      "Foundations of Tawhid",
    ]);
  });

  it("does not add context metadata to a standalone single", () => {
    (useContinueListening as unknown as Mock<any>).mockReturnValue({
      recentProgress: {
        lectureId: "single-123",
        lectureTitle: "A Standalone Lesson",
        lectureSlug: "a-standalone-lesson",
        format: "single",
        scholarName: "Shaikh Salih al-Fawzan",
        scholarSlug: "salih-al-fawzan",
        durationSeconds: 1800,
        positionSeconds: 600,
      },
      isLoading: false,
    });

    render(<HomeScreen />);

    expect(screen.queryByTestId("continue-listening-context")).toBeNull();
  });

  it("builds an editorial hierarchy from one recent feed snapshot", () => {
    const item = (slug: string, title: string) => ({
      kind: "single",
      id: slug,
      title,
      slug,
      scholarName: "Shaykh Salih al-Fawzan",
      scholarSlug: "salih-al-fawzan",
      thumbnailUrl: null,
      durationSeconds: 1800,
      publishedAt: "2026-08-22T00:00:00.000Z",
    });

    (useExploreRecentScreen as unknown as Mock<any>).mockReturnValue({
      data: {
        pages: [{ items: [item("recent-lesson", "Recently published lesson")] }],
      },
      isLoading: false,
    });
    (useHomePromotions as unknown as Mock<any>).mockReturnValue({
      data: {
        hero: item("featured-lesson", "Featured study path"),
        editorsPicks: [{ listing: item("curated-lesson", "Curated lesson") }],
      },
      isLoading: false,
    });

    render(<HomeScreen />);

    expect(screen.getByTestId("home-study-header")).toBeTruthy();
    expect(screen.getByTestId("home-featured-section")).toBeTruthy();
    expect(screen.getByTestId("home-discovery-section")).toBeTruthy();
    expect(screen.getByTestId("home-explore-link").getAttribute("href")).toBe("/explore");
    expect(screen.getByTestId("home-recent-section")).toBeTruthy();
    expect(screen.getByTestId("home-curated-section")).toBeTruthy();
    expect(screen.getByText("Recently published lesson")).toBeTruthy();
    expect(screen.getByText("Curated lesson")).toBeTruthy();
    expect(useExploreRecentScreen).toHaveBeenCalledTimes(1);

    const landmarks = [
      screen.getByTestId("home-study-header"),
      screen.getByTestId("home-featured-section"),
      screen.getByTestId("home-discovery-section"),
      screen.getByTestId("home-recent-section"),
      screen.getByTestId("home-curated-section"),
      screen.getByTestId("home-mobile-section"),
    ];

    for (let index = 1; index < landmarks.length; index += 1) {
      const previous = landmarks[index - 1];
      const current = landmarks[index];
      if (!previous || !current) {
        throw new Error("Expected every Home hierarchy landmark to be present");
      }
      expect(
        Boolean(previous.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING),
      ).toBe(true);
    }
  });

  it("hides continue listening section when recentProgress is null", () => {
    (useContinueListening as unknown as Mock<any>).mockReturnValue({
      recentProgress: null,
      isLoading: false,
    });

    render(<HomeScreen onContinueListening={mockOnContinueListening} />);

    expect(screen.queryByTestId("continue-listening-section")).toBeNull();
  });

  it("renders an explicit browse state when there is no recent progress or content", () => {
    render(<HomeScreen onContinueListening={mockOnContinueListening} />);

    expect(screen.getByTestId("home-empty-state")).toBeTruthy();
  });

  it("renders a browse prompt instead of inventing a lecture while content is empty", () => {
    render(<HomeScreen />);

    expect(screen.getByTestId("home-empty-state")).toBeTruthy();
    expect(screen.queryByTestId("home-hero-start")).toBeNull();
    expect(screen.getByTestId("home-recent-empty")).toBeTruthy();
    expect(screen.getByTestId("home-curated-empty")).toBeTruthy();
  });

  it("shows the hero loading state while optional home data is loading", () => {
    (useContinueListening as unknown as Mock<any>).mockReturnValue({
      recentProgress: null,
      isLoading: true,
    });
    (useExploreRecentScreen as unknown as Mock<any>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    (useHomePromotions as unknown as Mock<any>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<HomeScreen />);

    expect(screen.getByTestId("home-hero-skeleton")).toBeTruthy();
  });

  it("renders mobile app download section", () => {
    render(<HomeScreen onContinueListening={mockOnContinueListening} />);

    expect(screen.getByTestId("mobile-download-section")).toBeTruthy();
  });
});
