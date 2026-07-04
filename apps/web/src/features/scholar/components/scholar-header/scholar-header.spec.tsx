import { vi, describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScholarHeader } from "./scholar-header";
import type { ScholarHeaderProps } from "./scholar-header";

const mockScholar: ScholarHeaderProps["scholar"] = {
  id: "s-1",
  slug: "ibn-baz",
  name: "Abdul Aziz bin Baz",
  imageUrl: undefined,
  mainLanguage: "ar" as any,
  isKibar: false,
  lectureCount: 42,
  seriesCount: 5,
  totalDurationSeconds: 7200, // 2 hours
  bio: "This is a short bio.",
  country: "Saudi Arabia",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
};

describe("ScholarHeader", () => {
  it("renders scholar details successfully", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.getByText("Abdul Aziz bin Baz")).toBeInTheDocument();
    expect(screen.getByText("Saudi Arabia · ar")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument(); // lectures count
    expect(screen.getByText("5")).toBeInTheDocument(); // series count
    expect(screen.getByText("2h")).toBeInTheDocument(); // duration hours
  });

  it("renders avatar image when imageUrl is present", () => {
    const { container } = render(
      <ScholarHeader scholar={{ ...mockScholar, imageUrl: "/images/binbaz.jpg" }} />
    );
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toContain("binbaz.jpg");
    expect(img?.getAttribute("width")).toBe("144");
    expect(img?.getAttribute("height")).toBe("144");
  });

  it("renders fallback initial avatar when imageUrl is not present", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("does not truncate bio if it is 160 characters or less", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.getByText("This is a short bio.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /show/i })).toBeNull();
  });

  it("truncates bio if it is longer than 160 characters and shows expand toggle", () => {
    const longBio = "A".repeat(170);
    render(<ScholarHeader scholar={{ ...mockScholar, bio: longBio }} />);

    // Should show truncated bio with "..."
    const expectedTruncated = "A".repeat(160) + "...";
    expect(screen.getByText(expectedTruncated)).toBeInTheDocument();

    const toggleBtn = screen.getByRole("button", { name: "Show more" });
    expect(toggleBtn).toBeInTheDocument();

    // Click to expand
    fireEvent.click(toggleBtn);
    expect(screen.getByText(longBio)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(screen.getByRole("button", { name: "Show less" }));
    expect(screen.getByText(expectedTruncated)).toBeInTheDocument();
  });
});
