import { describe, it, expect } from "bun:test";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ScholarHeader, type ScholarHeaderProps } from "./scholar-header";

const mockScholar: ScholarHeaderProps["scholar"] = {
  id: "s-1",
  slug: "ibn-baz",
  name: "Abdul Aziz bin Baz",
  imageUrl: undefined,
  mainLanguage: "ar" as any,
  lectureCount: 42,
  seriesCount: 5,
  totalDurationSeconds: 7200, // 2 hours
  bio: "This is a short bio.",
  country: "SA",
  socialWebsite: "https://binbaz.org.sa",
  socialYoutube: "https://youtube.com/binbaz",
  socialTwitter: "https://x.com/binbaz",
  socialTelegram: "https://t.me/binbaz",
  socialFacebook: "https://facebook.com/binbaz",
  socialInstagram: "https://instagram.com/binbaz",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
};

describe("ScholarHeader", () => {
  it("renders scholar name and stats in row 1 and row 2", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.getByText("Abdul Aziz bin Baz")).toBeInTheDocument();
    expect(screen.getByText(/42 Lectures · 5 Series · 2h Total/)).toBeInTheDocument();
  });

  it("renders avatar image when imageUrl is present", () => {
    const { container } = render(
      <ScholarHeader
        scholar={{ ...mockScholar, imageUrl: "https://example.com/images/binbaz.jpg" }}
      />,
    );
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toContain("binbaz.jpg");
    expect(img?.getAttribute("width")).toBe("120");
    expect(img?.getAttribute("height")).toBe("120");
  });

  it("renders fallback initial avatar when imageUrl is not present", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders social icon links in row 3", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.getByRole("link", { name: "Website" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "YouTube" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "X (Twitter)" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Telegram" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Facebook" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toBeInTheDocument();
  });

  it("does not render country, language, or bio text", () => {
    render(<ScholarHeader scholar={mockScholar} />);
    expect(screen.queryByText("SA · ar")).toBeNull();
    expect(screen.queryByText("This is a short bio.")).toBeNull();
  });
});
