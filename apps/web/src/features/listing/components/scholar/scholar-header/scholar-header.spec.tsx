import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "bun:test";
import React from "react";

import { ScholarHeader, type ScholarHeaderProps } from "./scholar-header";

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
  }),
}));
vi.mock("@/shared/utils/format-scholar-name", () => ({
  useFormatScholarName: () => (scholar: { name: string }) => scholar.name,
}));

const mockScholar: ScholarHeaderProps["scholar"] = {
  id: "s-1",
  slug: "ibn-baz",
  name: "Abdul Aziz bin Baz",
  imageUrl: undefined,
  mainLanguage: "ar" as any,
  lectureCount: 42,
  seriesCount: 5,
  totalDurationSeconds: 7200,
  bio: "This is a short bio.",
  country: "SA",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
};

describe("ScholarHeader", () => {
  it("renders scholar name and stats", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.getByText("Abdul Aziz bin Baz")).toBeTruthy();
    expect(screen.getByText(/42 Lectures/)).toBeTruthy();
  });

  it("renders avatar image when imageUrl is present", () => {
    const { container } = render(
      <ScholarHeader
        scholar={{ ...mockScholar, imageUrl: "https://example.com/images/binbaz.jpg" }}
      />,
    );
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toContain("binbaz.jpg");
  });

  it("renders fallback initial avatar when imageUrl is not present", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("renders bio when present", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.getByText("This is a short bio.")).toBeTruthy();
  });

  it("does not render bio when absent", () => {
    render(<ScholarHeader scholar={{ ...mockScholar, bio: undefined }} />);
    expect(screen.queryByText("This is a short bio.")).toBeNull();
  });

  it("renders Follow button when onFollow is provided", () => {
    render(<ScholarHeader scholar={mockScholar} onFollow={vi.fn()} />);
    expect(screen.getByText("Follow")).toBeTruthy();
  });

  it("does not render Follow button when onFollow is not provided", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.queryByText("Follow")).toBeNull();
  });
});
