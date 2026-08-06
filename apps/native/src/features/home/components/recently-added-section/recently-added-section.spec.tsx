import { render, screen } from "@testing-library/react-native";
import React from "react";

import { RecentlyAddedSection } from "./recently-added-section";

describe("RecentlyAddedSection", () => {
  const mockItems = [
    {
      id: "lecture-1",
      slug: "lecture-1",
      title: "The Foundations of Tafsir",
      scholarName: "Shaykh Khalid Adh-Dhafiri",
      category: "Tafsir",
      lessonsCount: 3,
      completedLessonsCount: 1,
      dateFormatted: "Aug 2, 2026",
    },
  ];

  it("renders recently added title and lecture cards", async () => {
    await render(<RecentlyAddedSection items={mockItems} />);

    expect(screen.getByTestId("recently-added-section")).toBeTruthy();
    expect(screen.getByText("Recently added")).toBeTruthy();
    expect(screen.getByText("The Foundations of Tafsir")).toBeTruthy();
  });
});
