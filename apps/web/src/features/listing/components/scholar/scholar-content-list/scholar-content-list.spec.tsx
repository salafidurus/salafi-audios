import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ScholarContentList } from "./scholar-content-list";
import type { ScholarContentItemDto } from "@sd/core-contracts";
import { useScholarTopics, useScholarContent } from "@sd/domain-content";

vi.mock("@sd/domain-content", () => ({
  useScholarTopics: vi.fn(),
  useScholarContent: vi.fn(),
}));

vi.mock("@/features/settings/content-preference", () => ({
  useShowOriginalContent: () => false,
}));

vi.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string, options?: any) => {
      if (!options) {
        return fallback;
      }
      let result = fallback;
      for (const k of Object.keys(options)) {
        result = result.replace(`{{${k}}}`, String(options[k]));
      }
      return result;
    },
  }),
}));

const mockUseTopics = vi.mocked(useScholarTopics);
const mockUseContent = vi.mocked(useScholarContent);

const mockItems: ScholarContentItemDto[] = [
  {
    id: "item-1",
    slug: "series-1",
    title: "Awesome Series",
    type: "series",
    recencyAt: "2024-01-01T00:00:00Z",
    lectureCount: 12,
  },
  {
    id: "item-2",
    slug: "single-1",
    title: "Insightful Single",
    type: "single",
    recencyAt: "2024-01-02T00:00:00Z",
    durationSeconds: 2700,
  },
  {
    id: "item-3",
    slug: "collection-1",
    title: "Rich Collection",
    type: "collection",
    recencyAt: "2024-01-03T00:00:00Z",
    lectureCount: 5,
    coverImageUrl: "/images/cover.jpg",
  },
];

beforeEach(() => {
  mockUseTopics.mockReturnValue({
    data: { topics: [] },
    isFetching: false,
  } as unknown as ReturnType<typeof useScholarTopics>);
  mockUseContent.mockReturnValue({
    data: { items: [] },
    isFetching: false,
  } as unknown as ReturnType<typeof useScholarContent>);
});

describe("ScholarContentList", () => {
  it("shows loading state while topics are fetching", () => {
    mockUseTopics.mockReturnValue({
      data: undefined,
      isFetching: true,
    } as unknown as ReturnType<typeof useScholarTopics>);
    render(<ScholarContentList slug="ibn-baz" />);
    expect(screen.getByText("Loading…")).toBeTruthy();
  });

  it("renders topic-grouped sections when topics are available", () => {
    mockUseTopics.mockReturnValue({
      data: {
        topics: [
          { topicId: "t1", topicName: "Tawheed", items: [mockItems[0]!] },
          { topicId: "t2", topicName: "Aqeedah", items: [mockItems[1]!] },
        ],
      },
      isFetching: false,
    } as unknown as ReturnType<typeof useScholarTopics>);
    render(<ScholarContentList slug="ibn-baz" />);
    // Topics should be sorted alphabetically: Aqeedah before Tawheed
    const headers = screen.getAllByRole("heading", { level: 2 });
    expect(headers[0]?.textContent).toBe("Aqeedah");
    expect(headers[1]?.textContent).toBe("Tawheed");
    expect(screen.getByText("Awesome Series")).toBeTruthy();
    expect(screen.getByText("Insightful Single")).toBeTruthy();
  });

  it("renders flat fallback list when no topics exist", () => {
    mockUseContent.mockReturnValue({
      data: { items: mockItems },
      isFetching: false,
    } as unknown as ReturnType<typeof useScholarContent>);
    render(<ScholarContentList slug="ibn-baz" />);
    expect(screen.getByText("Awesome Series")).toBeTruthy();
    expect(screen.getByText("Insightful Single")).toBeTruthy();
    expect(screen.getByText("Single · 45m")).toBeTruthy();
    expect(screen.getByText("Rich Collection")).toBeTruthy();
  });

  it("renders empty state when no topics and no content", () => {
    render(<ScholarContentList slug="ibn-baz" />);
    expect(screen.getByText("No published content yet.")).toBeTruthy();
  });

  it("renders cover image or type icon fallback in flat list", () => {
    mockUseContent.mockReturnValue({
      data: { items: mockItems },
      isFetching: false,
    } as unknown as ReturnType<typeof useScholarContent>);
    const { container } = render(<ScholarContentList slug="ibn-baz" />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toContain("cover.jpg");
  });
});
