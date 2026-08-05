import { useContinueListening } from "@sd/domain-search";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import React from "react";

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
  useTopicsList: () => ({ data: [] }),
}));

vi.mock("@sd/domain-content", () => ({
  useInfiniteScholarsList: () => ({ data: undefined }),
  useExploreRecentScreen: () => ({ data: undefined }),
}));

vi.mock("../../hooks/use-home-promotions", () => ({
  useHomePromotions: () => ({
    data: { hero: null, editorsPicks: [] },
    isLoading: false,
  }),
}));

describe("HomeScreen", () => {
  const mockOnOpenSearch = vi.fn();
  const mockOnContinueListening = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useContinueListening as unknown as Mock<any>).mockReturnValue({
      recentProgress: null,
      isLoading: false,
    });
  });

  it("renders hero header, subtitle and search button", () => {
    render(
      <HomeScreen onOpenSearch={mockOnOpenSearch} onContinueListening={mockOnContinueListening} />,
    );

    const heroTitle = screen.getByTestId("home-hero-title");
    expect(heroTitle).toBeTruthy();

    const searchBtn = screen.getByText("What do you want to listen to?");
    expect(searchBtn).toBeTruthy();

    fireEvent.click(searchBtn);
    expect(mockOnOpenSearch).toHaveBeenCalled();
  });

  it("renders continue listening section when recentProgress is provided", () => {
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

    render(
      <HomeScreen onOpenSearch={mockOnOpenSearch} onContinueListening={mockOnContinueListening} />,
    );

    expect(screen.getByTestId("continue-listening-section")).toBeTruthy();

    const sectionTitle = screen.getByTestId("continue-listening-title");
    expect(sectionTitle.textContent).toBe("Continue Listening");

    const lectureTitle = screen.getByTestId("continue-listening-lecture-title");
    expect(lectureTitle.textContent).toBe("Tauheed Explained");

    const scholarName = screen.getByTestId("continue-listening-scholar-name");
    expect(scholarName.textContent).toBe("Shaikh Salih al-Fawzan");

    const progressText = screen.getByTestId("continue-listening-progress-text");
    expect(progressText.textContent).toBe("10:00 / 30:00");

    const card = screen.getByTestId("continue-listening-card");
    expect(card).toBeTruthy();
    fireEvent.click(card);

    expect(mockOnContinueListening).toHaveBeenCalledWith("tauheed-explained");
  });

  it("hides continue listening section when recentProgress is null", () => {
    (useContinueListening as unknown as Mock<any>).mockReturnValue({
      recentProgress: null,
      isLoading: false,
    });

    render(
      <HomeScreen onOpenSearch={mockOnOpenSearch} onContinueListening={mockOnContinueListening} />,
    );

    expect(screen.queryByTestId("continue-listening-section")).toBeNull();
  });

  it("renders hero start CTA when there is no recent progress", () => {
    render(
      <HomeScreen onOpenSearch={mockOnOpenSearch} onContinueListening={mockOnContinueListening} />,
    );

    expect(screen.getByTestId("home-hero-start")).toBeTruthy();
  });

  it("renders mobile app download section", () => {
    render(
      <HomeScreen onOpenSearch={mockOnOpenSearch} onContinueListening={mockOnContinueListening} />,
    );

    expect(screen.getByTestId("mobile-download-section")).toBeTruthy();
  });
});
