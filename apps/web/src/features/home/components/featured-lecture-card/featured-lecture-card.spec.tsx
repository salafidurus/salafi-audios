import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";
import React from "react";

import { FeaturedLectureCard } from "./featured-lecture-card";

describe("FeaturedLectureCard", () => {
  it("keeps the lecture action keyboard accessible", () => {
    const onClick = vi.fn();

    render(
      <FeaturedLectureCard
        title="Foundations of Faith"
        category="Aqeedah"
        scholarName="A Scholar"
        duration="20 min"
        progress={0.5}
        totalLessons={4}
        onClick={onClick}
      />,
    );

    const card = screen.getByRole("region", { name: "Foundations of Faith" });
    fireEvent.keyDown(card, { key: "Enter" });

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(card).toHaveAttribute("data-slot", "card");
  });
});
