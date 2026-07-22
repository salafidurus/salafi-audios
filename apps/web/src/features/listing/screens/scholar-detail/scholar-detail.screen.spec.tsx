import { describe, it, expect, beforeEach, vi } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScholarDetailScreen } from "./scholar-detail.screen";
import { useScholarDetail, useScholarContent, useScholarTopics } from "@sd/domain-content";

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

vi.mock("@/features/listing/components/scholar/scholar-content-list/scholar-content-list", () => ({
  ScholarContentList: ({
    slug,
    searchQuery,
    selectedTopicId,
  }: {
    slug: string;
    searchQuery?: string;
    selectedTopicId?: string | null;
  }) => (
    <div data-testid="scholar-content-list">
      Content:{slug} | query:{searchQuery} | topic:{selectedTopicId ?? "none"}
    </div>
  ),
}));

const mockDetail = useScholarDetail as any;
const mockContent = useScholarContent as any;
const mockTopics = useScholarTopics as any;

const mockScholar = {
  id: "s1",
  slug: "ibn-baz",
  name: "Ibn Baz",
  isActive: true,
  isKibar: false,
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
    expect(screen.getByText("Loading scholar…")).toBeTruthy();
  });

  it("shows not-found state when scholar is missing", () => {
    render(<ScholarDetailScreen slug="missing" />);
    expect(screen.getByText("Scholar not found")).toBeTruthy();
  });

  it("renders header, search bar, and content list", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<
      typeof useScholarDetail
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);
    expect(screen.getByTestId("scholar-header")).toBeTruthy();
    expect(screen.getByPlaceholderText("Search scholar content…")).toBeTruthy();
    expect(screen.getByTestId("scholar-content-list")).toBeTruthy();
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

  it("updates search query input and passes it to content list", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<
      typeof useScholarDetail
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);
    const input = screen.getByPlaceholderText("Search scholar content…");
    fireEvent.change(input, { target: { value: "Tawheed" } });
    expect(screen.getByText(/query:Tawheed/)).toBeTruthy();
  });

  it("toggles topic chip selections and passes them to content list", () => {
    mockDetail.mockReturnValue({ data: mockScholar, isFetching: false } as ReturnType<
      typeof useScholarDetail
    >);
    mockTopics.mockReturnValue({ data: mockTopicsData, isFetching: false } as ReturnType<
      typeof useScholarTopics
    >);
    render(<ScholarDetailScreen slug="ibn-baz" />);

    const aqeedahBtn = screen.getByText("Aqeedah");
    fireEvent.click(aqeedahBtn);
    expect(screen.getByText(/topic:t1/)).toBeTruthy();
  });
});
