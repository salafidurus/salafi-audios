import { useScholarDetail, useScholarContent, useScholarTopics } from "@sd/domain-content";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "bun:test";
import React from "react";

import { ScholarDetailScreen } from "./scholar-detail.screen";

vi.mock("@sd/domain-content", () => ({
  useScholarDetail: vi.fn(),
  useScholarContent: vi.fn(),
  useScholarTopics: vi.fn(),
}));

vi.mock("@/shared/components/ScreenView/ScreenView", () => ({
  ScreenView: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/shared/components/StickyHeaderLayout", () => ({
  StickyHeaderLayout: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    {
      Header: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
  ),
}));

vi.mock("@/shared/components/AppText/AppText", () => ({
  AppText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/features/listing/components/scholar/scholar-header/scholar-header", () => ({
  ScholarHeader: ({ scholar }: { scholar: { name: string } }) => (
    <div data-testid="scholar-header">Header:{scholar.name}</div>
  ),
}));

vi.mock("@/features/home/components/lecture-row/lecture-row", () => ({
  LectureRow: ({ title }: { title: string }) => (
    <div data-testid="lecture-row" data-title={title}>
      {title}
    </div>
  ),
}));

vi.mock("@/shared/components/Search", () => ({
  Search: {
    Bar: ({ placeholder, value, onChange }: any) => (
      <input
        data-testid="search-bar"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    ),
    Filter: ({ selected, chips, onChipChange, includeAllOption }: any) => (
      <div data-testid="search-filter" data-selected={JSON.stringify(selected)}>
        {includeAllOption && (
          <button data-chip-id="all" onClick={() => onChipChange?.("all")}>
            All
          </button>
        )}
        {chips.map((chip: any) => (
          <button key={chip.id} data-chip-id={chip.id} onClick={() => onChipChange?.(chip.id)}>
            {chip.label}
          </button>
        ))}
      </div>
    ),
  },
}));

vi.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: () => false,
}));

vi.mock("@/shared/hooks/use-listing-navigation", () => ({
  useListingNavigation: () => ({
    navigateToListing: vi.fn(),
  }),
}));

const mockDetail = useScholarDetail as any;
const mockContent = useScholarContent as any;
const mockTopics = useScholarTopics as any;

const mockScholar = {
  id: "s1",
  slug: "ibn-baz",
  name: "Ibn Baz",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  lectureCount: 10,
  seriesCount: 2,
  totalDurationSeconds: 3600,
};

const mockTopicsData = {
  topics: [
    {
      topicId: "t1",
      topicName: "Aqeedah",
      items: [{ id: "l1", slug: "l1", title: "Tawheed", type: "single", recencyAt: "2024-01-01" }],
    },
    {
      topicId: "t2",
      topicName: "Fiqh",
      items: [{ id: "l2", slug: "l2", title: "Salah", type: "series", recencyAt: "2024-01-02" }],
    },
  ],
};

const mockContentData = {
  items: [
    {
      id: "l1",
      slug: "l1",
      title: "Tawheed",
      type: "single",
      recencyAt: "2024-01-01",
      lectureCount: 5,
      durationSeconds: 3600,
    },
    {
      id: "l2",
      slug: "l2",
      title: "Salah",
      type: "series",
      recencyAt: "2024-01-02",
      lectureCount: 10,
      durationSeconds: 7200,
    },
  ],
};

beforeEach(() => {
  mockDetail.mockReturnValue({ data: undefined, isFetching: false } as ReturnType<
    typeof useScholarDetail
  >);
  mockContent.mockReturnValue({ data: undefined, isFetching: false } as ReturnType<
    typeof useScholarContent
  >);
  mockTopics.mockReturnValue({ data: undefined, isFetching: false } as ReturnType<
    typeof useScholarTopics
  >);
});

describe("ScholarDetailScreen", () => {
  it("shows loading state when fetching scholar", () => {
    mockDetail.mockReturnValue({ data: undefined, isFetching: true } as ReturnType<
      typeof useScholarDetail
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);
    expect(screen.getByText("Back to Scholars")).toBeTruthy();
  });

  it("shows not-found state when scholar is missing", () => {
    render(<ScholarDetailScreen slug="missing" />);
    expect(screen.getByText("Scholar not found")).toBeTruthy();
  });

  it("renders header and content rows", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<
      typeof useScholarDetail
    >);
    mockContent.mockReturnValue({ data: mockContentData, isFetching: false } as ReturnType<
      typeof useScholarContent
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);
    expect(screen.getByTestId("scholar-header")).toBeTruthy();
    expect(screen.getByRole("region", { name: "Published content" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Published content" })).toBeTruthy();
    expect(screen.getByText("2 items")).toBeTruthy();
    expect(screen.getAllByTestId("lecture-row")).toHaveLength(2);
  });

  it("renders topic filter chips when topic data is available", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<
      typeof useScholarDetail
    >);
    mockTopics.mockReturnValue({ data: mockTopicsData, isFetching: false } as ReturnType<
      typeof useScholarTopics
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Aqeedah")).toBeTruthy();
    expect(screen.getByText("Fiqh")).toBeTruthy();
  });

  it("updates search query and filters content rows", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<
      typeof useScholarDetail
    >);
    mockContent.mockReturnValue({ data: mockContentData, isFetching: false } as ReturnType<
      typeof useScholarContent
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);
    const input = screen.getByPlaceholderText("Search scholar content…");
    fireEvent.change(input, { target: { value: "Tawheed" } });
    expect(screen.getByText(/Tawheed/)).toBeTruthy();
  });

  it("toggles topic chip selections and filters content rows", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<
      typeof useScholarDetail
    >);
    mockContent.mockReturnValue({ data: mockContentData, isFetching: false } as ReturnType<
      typeof useScholarContent
    >);
    mockTopics.mockReturnValue({ data: mockTopicsData, isFetching: false } as ReturnType<
      typeof useScholarTopics
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);

    const aqeedahBtn = screen.getByText("Aqeedah");
    fireEvent.click(aqeedahBtn);
    expect(screen.getAllByTestId("lecture-row")).toHaveLength(1);
  });
});
