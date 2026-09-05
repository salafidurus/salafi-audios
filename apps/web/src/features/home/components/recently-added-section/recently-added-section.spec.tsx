import { useExploreRecentScreen } from "@sd/domain-content";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { RecentlyAddedSection } from "./recently-added-section";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@sd/domain-content", () => ({
  useExploreRecentScreen: vi.fn(),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

vi.mock("@/shared/hooks/use-formatted-scholar-name", () => ({
  useFormattedScholarName: vi.fn().mockReturnValue("Scholar Name"),
}));

const mockUseExploreRecentScreen = useExploreRecentScreen as unknown as ReturnType<typeof vi.fn>;

const mockContentItems = Array.from({ length: 14 }, (_, index) => ({
  kind: "lecture",
  id: `item-${index}`,
  slug: `listing-${index}`,
  title: `Recent Lecture ${index}`,
  scholarName: "Ibn Uthaymeen",
  scholarSlug: "ibn-uthaymeen",
  thumbnailUrl: null,
  durationSeconds: 3600,
  publishedAt: "2026-01-01T00:00:00.000Z",
}));

const mockPages = [
  {
    batches: [
      {
        kind: "listings",
        id: "listings:recent",
        title: { kind: "listings", id: "recent", label: "Continue exploring" },
        reason: "deterministic_recent",
        items: mockContentItems,
      },
    ],
  },
];

describe("RecentlyAddedSection", () => {
  beforeEach(() => {
    mockUseExploreRecentScreen.mockReturnValue({
      data: { pages: mockPages },
    });
  });

  it("requests a limited recent feed from the API", () => {
    render(<RecentlyAddedSection />);

    expect(mockUseExploreRecentScreen).toHaveBeenCalledWith({ limit: 10 });
  });

  it("renders the content items the API returned", () => {
    render(<RecentlyAddedSection />);

    expect(screen.getByText("Recently Added")).toBeTruthy();
    expect(screen.getAllByText(/Recent Lecture/)).toHaveLength(14);
    expect(screen.getByRole("button", { name: "Play Recent Lecture 0" })).toBeTruthy();
  });

  it("renders a featured card plus rows", () => {
    render(<RecentlyAddedSection />);

    expect(screen.getByText("Recently Added")).toBeTruthy();
  });

  it("renders an intentional empty state when there is no data", () => {
    mockUseExploreRecentScreen.mockReturnValue({ data: undefined });

    render(<RecentlyAddedSection />);

    expect(screen.getByText("Recently Added")).toBeTruthy();
    expect(screen.getByTestId("home-recent-empty")).toBeTruthy();
  });
});
