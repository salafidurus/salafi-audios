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

const mockContentItems = Array.from({ length: 10 }, (_, index) => ({
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
    items: [
      ...mockContentItems.slice(0, 2),
      { kind: "scholar_row", scholars: [] },
      { kind: "topic_row", topicName: "Fiqh", items: [] },
      ...mockContentItems.slice(2),
    ],
  },
];

describe("RecentlyAddedSection", () => {
  beforeEach(() => {
    mockUseExploreRecentScreen.mockReturnValue({
      data: { pages: mockPages },
    });
  });

  it("renders a card per content item up to the eight-item cap", () => {
    render(<RecentlyAddedSection />);

    expect(screen.getByText("Recently Added")).toBeTruthy();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(8);
  });

  it("renders a featured card plus rows", () => {
    render(<RecentlyAddedSection />);

    expect(screen.getByText("Recently Added")).toBeTruthy();
  });

  it("renders nothing when there is no data", () => {
    mockUseExploreRecentScreen.mockReturnValue({ data: undefined });

    render(<RecentlyAddedSection />);

    expect(screen.queryByText("Recently Added")).toBeNull();
  });
});
