import { describe, it, expect, beforeEach, vi, type Mock } from "bun:test";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { HomeScreen } from "./home.screen";
import { useContinueListening } from "@sd/domain-search";

// Mock the useContinueListening hook from @sd/domain-search
vi.mock("@sd/domain-search", () => ({
  useContinueListening: vi.fn(),
}));

describe("HomeScreen", () => {
  const mockOnOpenSearch = vi.fn();
  const mockOnContinueListening = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return value: loading false, no progress data
    (useContinueListening as unknown as Mock<any>).mockReturnValue({
      recentProgress: null,
      isLoading: false,
    });
  });

  it("renders hero header, tagline and search button using testIDs", () => {
    render(
      <HomeScreen onOpenSearch={mockOnOpenSearch} onContinueListening={mockOnContinueListening} />,
    );

    // Hero title and tagline via testID
    const heroTitle = screen.getByTestId("home-hero-title");
    expect(heroTitle).toBeTruthy();
    expect(heroTitle.textContent).toBe("Salafi Durus");

    const heroTagline = screen.getByTestId("home-hero-tagline");
    expect(heroTagline).toBeTruthy();
    expect(heroTagline.textContent).toBe("Listen to audio lectures from trusted Salafi scholars");

    // Search button component (which renders text "What do you want to listen to?")
    const searchBtn = screen.getByText("What do you want to listen to?");
    expect(searchBtn).toBeTruthy();

    // Triggers callback
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
        durationSeconds: 1800, // 30 minutes
        positionSeconds: 600, // 10 minutes
      },
      isLoading: false,
    });

    render(
      <HomeScreen onOpenSearch={mockOnOpenSearch} onContinueListening={mockOnContinueListening} />,
    );

    // Verify sections and text using testIDs
    expect(screen.getByTestId("continue-listening-section")).toBeTruthy();

    const sectionTitle = screen.getByTestId("continue-listening-title");
    expect(sectionTitle.textContent).toBe("Continue Listening");

    const lectureTitle = screen.getByTestId("continue-listening-lecture-title");
    expect(lectureTitle.textContent).toBe("Tauheed Explained");

    const scholarName = screen.getByTestId("continue-listening-scholar-name");
    expect(scholarName.textContent).toBe("Shaikh Salih al-Fawzan");

    const progressText = screen.getByTestId("continue-listening-progress-text");
    expect(progressText.textContent).toBe("10:00 / 30:00");

    // Click continue listening card using its testID
    const card = screen.getByTestId("continue-listening-card");
    expect(card).toBeTruthy();
    fireEvent.click(card);

    expect(mockOnContinueListening).toHaveBeenCalledWith("lecture-123");
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

  it("renders the 3 platform feature cards using testIDs", () => {
    render(
      <HomeScreen onOpenSearch={mockOnOpenSearch} onContinueListening={mockOnContinueListening} />,
    );

    // Section header
    expect(screen.getByTestId("features-section-title").textContent).toBe("Why Salafi Durus");

    // Card 1
    const cardScholars = screen.getByTestId("feature-card-scholars");
    expect(cardScholars).toBeTruthy();
    expect(screen.getByTestId("feature-card-title-scholars").textContent).toBe("Verified Scholars");

    // Card 2
    const cardOffline = screen.getByTestId("feature-card-offline");
    expect(cardOffline).toBeTruthy();
    expect(screen.getByTestId("feature-card-title-offline").textContent).toBe("Offline Sync");

    // Card 3
    const cardPleasure = screen.getByTestId("feature-card-pleasure");
    expect(cardPleasure).toBeTruthy();
    expect(screen.getByTestId("feature-card-title-pleasure").textContent).toBe(
      "Seeking His Pleasure",
    );
  });

  it("renders disabled mobile app download buttons with Coming Soon badges using testIDs", () => {
    render(
      <HomeScreen onOpenSearch={mockOnOpenSearch} onContinueListening={mockOnContinueListening} />,
    );

    // Verify download header
    expect(screen.getByTestId("mobile-download-title").textContent).toBe("Coming to Mobile");

    // Apple App Store button is disabled
    const appStoreBtn = screen.getByTestId("download-badge-app-store") as HTMLButtonElement;
    expect(appStoreBtn).toBeTruthy();
    expect(appStoreBtn.disabled).toBe(true);

    // Google Play Store button is disabled
    const googlePlayBtn = screen.getByTestId("download-badge-google-play") as HTMLButtonElement;
    expect(googlePlayBtn).toBeTruthy();
    expect(googlePlayBtn.disabled).toBe(true);

    // Verify "Coming Soon" badges exist via testID
    expect(screen.getByTestId("coming-soon-badge-app-store").textContent).toBe("Coming Soon");
    expect(screen.getByTestId("coming-soon-badge-google-play").textContent).toBe("Coming Soon");
  });
});
