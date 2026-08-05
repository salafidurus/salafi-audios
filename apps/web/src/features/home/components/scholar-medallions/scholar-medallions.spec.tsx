import { useInfiniteScholarsList } from "@sd/domain-content";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { ScholarMedallions } from "./scholar-medallions";

vi.mock("@sd/domain-content", () => ({
  useInfiniteScholarsList: vi.fn(),
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));

const mockUseInfiniteScholarsList = useInfiniteScholarsList as unknown as ReturnType<typeof vi.fn>;

const mockScholars = [
  {
    id: "s1",
    slug: "al-albani",
    name: "Muhammad Nasiruddin al-Albani",
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "s2",
    slug: "ibn-baz",
    name: "Abdul-Aziz ibn Baz",
    isActive: true,
    createdAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "s3",
    slug: "ibn-uthaymeen",
    name: "Muhammad ibn Salih al-Uthaymeen",
    isActive: true,
    createdAt: "2025-01-03T00:00:00.000Z",
  },
];

describe("ScholarMedallions", () => {
  beforeEach(() => {
    mockUseInfiniteScholarsList.mockReturnValue({
      data: { pages: [{ items: mockScholars }] },
    });
  });

  it("renders a medallion per scholar with the scholar name", () => {
    render(<ScholarMedallions />);

    const medallions = screen.getAllByTestId("scholar-medallion");
    expect(medallions).toHaveLength(3);
    expect(screen.getByText("Abdul-Aziz ibn Baz")).toBeTruthy();
  });

  it("links each medallion to the scholar detail route", () => {
    render(<ScholarMedallions />);

    const medallions = screen.getAllByTestId("scholar-medallion");
    expect(medallions[0]!.getAttribute("href")).toBe("/scholars/al-albani");
    expect(medallions[1]!.getAttribute("href")).toBe("/scholars/ibn-baz");
    expect(medallions[2]!.getAttribute("href")).toBe("/scholars/ibn-uthaymeen");
  });

  it("renders nothing when there are no scholars", () => {
    mockUseInfiniteScholarsList.mockReturnValue({ data: undefined });

    render(<ScholarMedallions />);

    expect(screen.queryAllByTestId("scholar-medallion")).toHaveLength(0);
  });
});
