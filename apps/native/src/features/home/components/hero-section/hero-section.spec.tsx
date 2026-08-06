import { render, screen } from "@testing-library/react-native";
import React from "react";

import { HeroSection } from "./hero-section";

describe("HeroSection", () => {
  const mockContinueItem = {
    id: "signs-prophethood",
    slug: "signs-prophethood",
    title: "The Signs of Prophethood by al-Firyabi",
    scholarName: "Shaykh Arafat bn Hasan Al-Muhammadi",
    progressPercent: 0.83,
    currentLessonNumber: 5,
    totalLessonsCount: 6,
  };

  const mockFeaturedItem = {
    id: "tafsir-mufassal",
    slug: "tafsir-mufassal",
    title: "Sittings on the Tafsir of al-Mufassal Surahs",
    scholarName: "Shaykh Allamah Salih ibn Fawzan al-Fawzan",
    totalLessonsCount: 4,
  };

  it("renders ContinueListeningCard when continueListeningItem exists", async () => {
    await render(<HeroSection continueListeningItem={mockContinueItem} />);

    expect(screen.getByTestId("continue-listening-card-signs-prophethood")).toBeTruthy();
    expect(screen.getByText("The Signs of Prophethood by al-Firyabi")).toBeTruthy();
  });

  it("renders FeaturedHeroCard when no continueListeningItem exists", async () => {
    await render(<HeroSection featuredItem={mockFeaturedItem} />);

    expect(screen.getByTestId("featured-hero-card-tafsir-mufassal")).toBeTruthy();
    expect(screen.getByText("Sittings on the Tafsir of al-Mufassal Surahs")).toBeTruthy();
  });
});
